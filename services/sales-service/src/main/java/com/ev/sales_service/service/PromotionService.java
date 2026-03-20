package com.ev.sales_service.service;

import com.ev.common_lib.event.PromotionCreatedEvent;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.sales_service.entity.Outbox;
import com.ev.sales_service.entity.Promotion;
import com.ev.sales_service.enums.PromotionStatus;
import com.ev.sales_service.repository.OutboxRepository;
import com.ev.sales_service.repository.PromotionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PromotionService {

    @Value("${user-service.base-url}")
    private String userServiceBaseUrl;

    private final PromotionRepository promotionRepository;
    private final OutboxRepository outboxRepository;
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
                LocalDateTime.now()
        );

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

    public Promotion updatePromotion(UUID id, Promotion promotion) {
        Promotion existing = promotionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Promotion not found"));
        existing.setPromotionName(promotion.getPromotionName());
        existing.setDescription(promotion.getDescription());
        existing.setDiscountRate(promotion.getDiscountRate());
        existing.setStartDate(promotion.getStartDate());
        existing.setEndDate(promotion.getEndDate());
        existing.setApplicableModelsJson(promotion.getApplicableModelsJson());
        existing.setStatus(promotion.getStatus());
        return promotionRepository.save(existing);
    }

    public Promotion getPromotionById(UUID id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Promotion not found"));
    }

    public List<Promotion> getAllPromotions() {
        updatePromotionStatuses();
        return promotionRepository.findAll();
    }


    private void updatePromotionStatuses() {
        LocalDateTime now = LocalDateTime.now();
        List<Promotion> promotions = promotionRepository.findAll();

        for (Promotion promotion : promotions) {
            if (promotion.getStartDate() == null || promotion.getEndDate() == null) continue;

            // Bỏ qua nếu đã xóa
            if (promotion.getStatus().equals(PromotionStatus.DELETED)) continue;

            // Hết hạn
            if (promotion.getEndDate().isBefore(now)) {
                promotion.setStatus(PromotionStatus.EXPIRED);
                continue;
            }

            // Đang trong thời gian hoạt động
            if (promotion.getStartDate().isBefore(now) && promotion.getEndDate().isAfter(now)) {
                if (promotion.getStatus().equals(PromotionStatus.DRAFT)) {
                    promotion.setStatus(PromotionStatus.INACTIVE); // Đã tới ngày nhưng chưa kích hoạt
                } else if (promotion.getStatus().equals(PromotionStatus.NEAR)) {
                    promotion.setStatus(PromotionStatus.ACTIVE); // Đã duyệt và tới ngày
                }

            }
        }
        promotionRepository.saveAll(promotions);
    }


    public void deletePromotion(UUID id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));
        promotion.setStatus(PromotionStatus.DELETED);
        promotionRepository.save(promotion);
    }

    public List<Promotion> getPromotionsByStatus(PromotionStatus status) {
        return promotionRepository.findByStatus(status);
    }

    public Promotion authenticPromotion(UUID id) {
        Promotion existing = promotionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Promotion not found"));
        existing.setStatus(PromotionStatus.NEAR);
        return promotionRepository.save(existing);
    }

    /**
     * Lấy các KM đang ACTIVE cho một đại lý cụ thể
     * (Phục vụ cho Form tạo báo giá)
     *
     * @param dealerId ID của đại lý (lấy từ header)
     * @return List<Promotion>
     */
    public List<Promotion> getActivePromotionsForDealer(UUID dealerId, Optional<Long> modelId) {
        // 1. Lấy tất cả KM đang ACTIVE
        List<Promotion> allActivePromotions = promotionRepository.findByStatus(PromotionStatus.ACTIVE);

        // 2. Lọc danh sách
        return allActivePromotions.stream()
                .filter(promo -> {
                    String dealerJson = promo.getDealerIdJson();
                    String modelJson = promo.getApplicableModelsJson();
                    LocalDateTime now = LocalDateTime.now();

                    // 2.1. Kiểm tra ngày (phòng trường hợp cron job chưa chạy)
                    if (promo.getStartDate() != null && promo.getStartDate().isAfter(now)) return false;
                    if (promo.getEndDate() != null && promo.getEndDate().isBefore(now)) return false;

                    // 2.2. Lọc theo Đại lý
                    boolean dealerMatch = false;
                    if (dealerJson == null || dealerJson.isEmpty() || dealerJson.equals("[]")) {
                        dealerMatch = true; // KM chung
                    } else {
                        dealerMatch = dealerJson.contains(dealerId.toString()); // KM riêng
                    }

                    if (!dealerMatch) return false; // Nếu không khớp đại lý -> loại

                    // 2.3. Lọc theo Model (NẾU modelId được cung cấp)
                    if (modelId.isPresent()) {
                        Long mId = modelId.get();
                        // Nếu KM này có áp dụng cho model cụ thể (không rỗng)
                        if (modelJson != null && !modelJson.isEmpty() && !modelJson.equals("[]")) {
                            // Và nếu JSON model *không* chứa modelId -> loại
                            if (!modelJson.contains(mId.toString())) {
                                return false;
                            }
                        }
                        // (Nếu KM không chỉ định model, nó được coi là áp dụng cho mọi model)
                    }

                    return true; // Vượt qua mọi kiểm tra
                })
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả khuyến mãi đang ACTIVE (tùy chọn lọc theo modelId)
     */
    public List<Promotion> getActivePromotions(Optional<Long> modelId) {
        List<Promotion> allActivePromotions = promotionRepository.findByStatus(PromotionStatus.ACTIVE);
        LocalDateTime now = LocalDateTime.now();

        return allActivePromotions.stream()
                .filter(promo -> {
                    // Kiểm tra thời gian hợp lệ
                    if (promo.getStartDate() != null && promo.getStartDate().isAfter(now)) return false;
                    if (promo.getEndDate() != null && promo.getEndDate().isBefore(now)) return false;

                    // Nếu có modelId, lọc theo model
                    if (modelId.isPresent()) {
                        String modelJson = promo.getApplicableModelsJson();
                        Long mId = modelId.get();
                        if (modelJson != null && !modelJson.isEmpty() && !modelJson.equals("[]")) {
                            return modelJson.contains(mId.toString());
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

}

