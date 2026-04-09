package com.ev.sales_service.service;

import com.ev.common_lib.event.PromotionCreatedEvent;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.sales_service.entity.Outbox;
import com.ev.sales_service.entity.Promotion;
import com.ev.sales_service.enums.PromotionStatus;
import com.ev.sales_service.repository.OutboxRepository;
import com.ev.sales_service.repository.PromotionRepository;
import com.ev.sales_service.repository.QuotationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PromotionService {

    // S1192: Extract duplicate string literals into constants
    private static final String PROMOTION_NOT_FOUND = "Promotion not found";
    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_DEALER_MANAGER = "DEALER_MANAGER";
    private static final String ROLE_EVM_STAFF = "EVM_STAFF";
    private static final String EMPTY_JSON_ARRAY = "[]";

    @Value("${user-service.base-url}")
    private String userServiceBaseUrl;

    private final PromotionRepository promotionRepository;
    private final OutboxRepository outboxRepository;
    private final QuotationRepository quotationRepository;
    private final ObjectMapper objectMapper; // spring-boot auto-configures

    @Transactional
    public Promotion createPromotion(Promotion promotion) {
        promotion.setStatus(PromotionStatus.DRAFT);
        Promotion saved = promotionRepository.save(promotion);

        // prepare event
        String eventId = UUID.randomUUID().toString();
        PromotionCreatedEvent event = new PromotionCreatedEvent(
                eventId,
                saved.getPromotionId(),
                saved.getPromotionName(),
                saved.getDescription(),
                saved.getDiscountRate(),
                saved.getStartDate(),
                saved.getEndDate(),
                LocalDateTime.now());

        try {
            String payload = objectMapper.writeValueAsString(event);

            Outbox out = Outbox.builder()
                    .id(eventId)
                    .aggregateType("Promotion")
                    .aggregateId(saved.getPromotionId().toString())
                    .eventType("PromotionCreated")
                    .payload(payload)
                    .status("NEW")
                    .attempts(0)
                    .createdAt(LocalDateTime.now())
                    .build();

            outboxRepository.save(out);
        } catch (Exception e) {
            // Nếu serialize lỗi thì rollback transaction (thrown exception)
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        return saved;
    }

    public Promotion updatePromotion(UUID id, Promotion promotion, String roles, String currentUserDealerId) {
        Promotion existing = promotionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(PROMOTION_NOT_FOUND));

        // S1066: Merge nested if — Phân quyền: Dealer Manager chỉ được sửa DRAFT và chỉ sửa của mình
        if (isDealerManagerOnly(roles)) {
            if (existing.getStatus() != PromotionStatus.DRAFT) {
                throw new AppException(ErrorCode.DATA_NOT_FOUND); // Hoặc tạo ErrorCode mới cho "Promotion already authenticated"
            }
            // Kiểm tra dealerId (nếu cần thiết, dựa trên logic dealerIdJson)
            if (currentUserDealerId != null && !existing.getDealerIdJson().contains(currentUserDealerId)) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
        }

        if (quotationRepository.existsByPromotionId(id)) {
            throw new AppException(ErrorCode.PROMOTION_IN_USE);
        }

        existing.setPromotionName(promotion.getPromotionName());
        existing.setDescription(promotion.getDescription());
        existing.setDiscountRate(promotion.getDiscountRate());
        existing.setStartDate(promotion.getStartDate());
        existing.setEndDate(promotion.getEndDate());
        existing.setApplicableModelsJson(promotion.getApplicableModelsJson());
        existing.setDealerIdJson(promotion.getDealerIdJson());
        existing.setStatus(promotion.getStatus());
        return promotionRepository.save(existing);
    }

    public Promotion getPromotionById(UUID id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(PROMOTION_NOT_FOUND));
    }

    public List<Promotion> getAllPromotions() {
        updatePromotionStatuses();
        return promotionRepository.findAll().stream()
                .filter(p -> p.getStatus() != PromotionStatus.DELETED)
                .toList(); // S6204: replace Collectors.toList() with Stream.toList()
    }

    // S135: Refactored to reduce break/continue count by using stream + filter + forEach
    private void updatePromotionStatuses() {
        LocalDateTime now = LocalDateTime.now();
        List<Promotion> promotions = promotionRepository.findAll();

        promotions.stream()
                .filter(p -> p.getStartDate() != null && p.getEndDate() != null)
                .filter(p -> !p.getStatus().equals(PromotionStatus.DELETED))
                .forEach(promotion -> updateSinglePromotionStatus(promotion, now));

        promotionRepository.saveAll(promotions);
    }

    private void updateSinglePromotionStatus(Promotion promotion, LocalDateTime now) {
        // Hết hạn
        if (promotion.getEndDate().isBefore(now)) {
            promotion.setStatus(PromotionStatus.EXPIRED);
            return;
        }

        // Đang trong thời gian hoạt động
        if (promotion.getStartDate().isBefore(now) && promotion.getEndDate().isAfter(now)
                && promotion.getStatus().equals(PromotionStatus.DRAFT)) {
            promotion.setStatus(PromotionStatus.INACTIVE); // Đã tới ngày nhưng chưa kích hoạt
        } else if (promotion.getStartDate().isBefore(now) && promotion.getEndDate().isAfter(now)
                && promotion.getStatus().equals(PromotionStatus.NEAR)) {
            promotion.setStatus(PromotionStatus.ACTIVE); // Đã duyệt và tới ngày
        }
    }

    @Transactional
    public void deletePromotion(UUID id, String roles, String currentUserDealerId) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

        // S1066: Merge nested if — Phân quyền xóa tương tự update
        if (isDealerManagerOnly(roles) && promotion.getStatus() != PromotionStatus.DRAFT) {
            throw new AppException(ErrorCode.DATA_NOT_FOUND);
        }

        if (quotationRepository.existsByPromotionId(id)) {
            throw new AppException(ErrorCode.PROMOTION_IN_USE);
        }

        // Thay vì hard delete, dùng soft delete để đồng bộ với logic list/filter
        promotion.setStatus(PromotionStatus.DELETED);
        promotionRepository.save(promotion);
    }

    public List<Promotion> getPromotionsByStatus(PromotionStatus status) {
        return promotionRepository.findByStatus(status);
    }

    public List<Promotion> searchPromotions(String status, String modelId, String dealerId, String searchTerm,
            String roles, String currentUserDealerId) {
        updatePromotionStatuses();

        String finalDealerId = dealerId;

        // Nếu là Dealer Manager, ép buộc chỉ xem của dealer mình
        if (isDealerManagerOnly(roles)) {
            finalDealerId = currentUserDealerId;
            if (finalDealerId == null) {
                return List.of(); // Không có dealerId thì không thấy gì
            }
        }

        return promotionRepository.searchPromotions(status, modelId, finalDealerId, searchTerm);
    }

    public Promotion authenticPromotion(UUID id, String roles) {
        // Chỉ Admin/Staff EVM mới được duyệt
        if (roles == null || (!roles.contains(ROLE_ADMIN) && !roles.contains(ROLE_EVM_STAFF))) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        Promotion existing = promotionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(PROMOTION_NOT_FOUND));
        existing.setStatus(PromotionStatus.NEAR);
        return promotionRepository.save(existing);
    }

    /**
     * Lấy các KM đang ACTIVE cho một đại lý cụ thể
     * (Phục vụ cho Form tạo báo giá)
     *
     * @param dealerId ID của đại lý (lấy từ header)
     * @param modelId  ID của model (tùy chọn)
     * @return List<Promotion>
     */
    // S3776: Refactored to reduce cognitive complexity by extracting helper methods
    public List<Promotion> getActivePromotionsForDealer(UUID dealerId, Optional<Long> modelId) {
        // 1. Lấy tất cả KM đang ACTIVE
        List<Promotion> allActivePromotions = promotionRepository.findByStatus(PromotionStatus.ACTIVE);

        // 2. Lọc danh sách
        return allActivePromotions.stream()
                .filter(promo -> isWithinDateRange(promo, LocalDateTime.now()))
                .filter(promo -> isDealerMatch(promo.getDealerIdJson(), dealerId.toString()))
                .filter(promo -> isModelMatch(promo.getApplicableModelsJson(), modelId))
                .toList();
    }

    /**
     * Lấy tất cả khuyến mãi đang ACTIVE (tùy chọn lọc theo modelId)
     */
    public List<Promotion> getActivePromotions(Optional<Long> modelId) {
        List<Promotion> allActivePromotions = promotionRepository.findByStatus(PromotionStatus.ACTIVE);
        LocalDateTime now = LocalDateTime.now();

        return allActivePromotions.stream()
                .filter(promo -> isWithinDateRange(promo, now))
                .filter(promo -> isModelMatch(promo.getApplicableModelsJson(), modelId))
                .toList();
    }

    /**
     * Lấy danh sách Khuyến mãi ACTIVE và NEAR cho Dealer Staff View
     * (Vì bạn yêu cầu không sửa API cũ và chỉ hiển thị ACTIVE/NEAR)
     */
    public List<Promotion> getActivePromotionsForDealerList(UUID dealerId) {
        // 1. Lấy tất cả KM ACTIVE và NEAR (Đã được duyệt)
        List<Promotion> promotions = promotionRepository.findByStatusIn(
                List.of(PromotionStatus.ACTIVE, PromotionStatus.NEAR));

        // 2. Lọc theo Dealer
        return promotions.stream()
                .filter(promo -> isDealerMatchWithParsing(promo.getDealerIdJson(), dealerId))
                .toList();
    }

    // ===== Helper methods (S3776 / S1066: reduce cognitive complexity & merge ifs) =====

    /**
     * Kiểm tra role chỉ là Dealer Manager (không phải Admin hoặc EVM Staff)
     */
    private boolean isDealerManagerOnly(String roles) {
        return roles != null && roles.contains(ROLE_DEALER_MANAGER)
                && !roles.contains(ROLE_ADMIN) && !roles.contains(ROLE_EVM_STAFF);
    }

    /**
     * Kiểm tra promotion có nằm trong khoảng thời gian hợp lệ không
     */
    private boolean isWithinDateRange(Promotion promo, LocalDateTime now) {
        if (promo.getStartDate() != null && promo.getStartDate().isAfter(now)) {
            return false;
        }
        return promo.getEndDate() == null || !promo.getEndDate().isBefore(now);
    }

    /**
     * Kiểm tra dealer có khớp không (so sánh chuỗi đơn giản)
     */
    private boolean isDealerMatch(String dealerJson, String dealerIdStr) {
        if (isEmptyJsonArray(dealerJson)) {
            return true; // KM chung
        }
        return dealerJson.contains(dealerIdStr); // KM riêng
    }

    /**
     * Kiểm tra dealer match với JSON parsing (hỗ trợ cả DLRxxx và UUID)
     */
    private boolean isDealerMatchWithParsing(String dealerJson, UUID dealerId) {
        if (isEmptyJsonArray(dealerJson)) {
            return true;
        }

        try {
            // Parse thành List<String> để chấp nhận cả DLRxxx và UUID
            List<String> dealerIds = objectMapper.readValue(dealerJson,
                    new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {
                    });

            String searchId = dealerId.toString();
            return dealerIds != null && dealerIds.stream()
                    .anyMatch(id -> id.equalsIgnoreCase(searchId));
        } catch (Exception e) {
            // Fallback an toàn nếu parse lỗi
            return dealerJson.contains(dealerId.toString());
        }
    }

    /**
     * Kiểm tra model có khớp không
     */
    private boolean isModelMatch(String modelJson, Optional<Long> modelId) {
        if (modelId.isEmpty()) {
            return true; // Không filter theo model
        }

        Long mId = modelId.get();
        // Nếu KM không chỉ định model → áp dụng cho mọi model
        if (isEmptyJsonArray(modelJson)) {
            return true;
        }
        // JSON model phải chứa modelId
        return modelJson.contains(mId.toString());
    }

    /**
     * Kiểm tra JSON array rỗng hay null
     */
    private boolean isEmptyJsonArray(String json) {
        return json == null || json.isEmpty() || json.equals(EMPTY_JSON_ARRAY);
    }

}

