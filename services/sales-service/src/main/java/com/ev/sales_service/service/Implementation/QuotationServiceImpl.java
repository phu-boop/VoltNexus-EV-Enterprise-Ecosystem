package com.ev.sales_service.service.Implementation;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.sales_service.dto.request.QuotationCalculateRequest;
import com.ev.sales_service.dto.request.QuotationCreateRequest;
import com.ev.sales_service.dto.request.QuotationFilterRequest;
import com.ev.sales_service.dto.request.QuotationSendRequest;
import com.ev.sales_service.dto.response.*;
import com.ev.sales_service.entity.Promotion;
import com.ev.sales_service.entity.Quotation;
import com.ev.sales_service.enums.PromotionStatus;
import com.ev.sales_service.enums.QuotationStatus;
import com.ev.sales_service.repository.PromotionRepository;
import com.ev.sales_service.repository.QuotationRepository;
import com.ev.sales_service.client.CustomerClient;
import com.ev.sales_service.service.Interface.EmailService;
import com.ev.sales_service.service.Interface.QuotationService;
import com.ev.sales_service.service.Interface.SalesOrderServiceB2C;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.io.PrintStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class QuotationServiceImpl implements QuotationService {
    private final CustomerClient customerClient;
    private final QuotationRepository quotationRepository;
    private final PromotionRepository promotionRepository;
    private final EmailService emailService;
    private final ModelMapper modelMapper;

    private final SalesOrderServiceB2C salesOrderServiceB2C;
    @Autowired
    private final ObjectMapper objectMapper;

    @Override
    public QuotationResponse createDraftQuotation(QuotationCreateRequest request) {
        log.info("Creating draft quotation for customer: {}", request.getCustomerId());

        Quotation quotation = Quotation.builder()
                .dealerId(request.getDealerId())
                .customerId(request.getCustomerId())
                .modelId(request.getModelId())
                .variantId(request.getVariantId())
                .staffId(request.getStaffId())
                .basePrice(request.getBasePrice())
                .termsConditions(request.getTermsConditions())
                .status(QuotationStatus.DRAFT)
                .quotationDate(LocalDateTime.now())
                .build();

        Quotation savedQuotation = quotationRepository.save(quotation);
        return mapToResponse(savedQuotation);
    }

    @Override
    public QuotationResponse calculateQuotationPrice(UUID quotationId, QuotationCalculateRequest request) {
        // 1. Lấy quotation từ DB
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

        if (quotation.getStatus() != QuotationStatus.DRAFT && quotation.getStatus() != QuotationStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_QUOTATION_STATUS);
        }

        BigDecimal totalDiscount = BigDecimal.ZERO;
        Set<Promotion> appliedPromotions = new HashSet<>();

        // 2. Áp dụng promotions từ request
        if (request.getPromotionIds() != null && !request.getPromotionIds().isEmpty()) {
            List<Promotion> promotionsFromDb = promotionRepository.findAllById(request.getPromotionIds());
            for (Promotion promotion : promotionsFromDb) {
                appliedPromotions.add(promotion);
                BigDecimal discountAmount = quotation.getBasePrice()
                        .multiply(promotion.getDiscountRate())
                        .divide(BigDecimal.valueOf(1));
                totalDiscount = totalDiscount.add(discountAmount);
            }
        }

        // 3. Áp dụng additionalDiscountRate từ request
        if (request.getAdditionalDiscountRate() != null) {
            BigDecimal additionalDiscount = quotation.getBasePrice()
                    .multiply(request.getAdditionalDiscountRate())
                    .divide(BigDecimal.valueOf(100));
            totalDiscount = totalDiscount.add(additionalDiscount);
        }

        // 4. Không vượt quá basePrice
        if (totalDiscount.compareTo(quotation.getBasePrice()) > 0) {
            totalDiscount = quotation.getBasePrice();
        }

        BigDecimal finalPrice = quotation.getBasePrice().subtract(totalDiscount);

        // 5. Cập nhật promotions cho quotation an toàn
        Hibernate.initialize(quotation.getPromotions());
        quotation.getPromotions().clear();
        quotation.getPromotions().addAll(appliedPromotions);

        // 6. Cập nhật quotation
        quotation.setDiscountAmount(totalDiscount);
        quotation.setFinalPrice(finalPrice);
        quotation.setStatus(QuotationStatus.PENDING);

        Quotation updatedQuotation = quotationRepository.save(quotation);

        return mapToResponse(updatedQuotation);
    }


    // phương thức sendQuotationToCustomer
    @Override
    public QuotationResponse sendQuotationToCustomer(UUID quotationId, QuotationSendRequest request) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

        if (quotation.getStatus() != QuotationStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_QUOTATION_STATUS);
        }

        if (quotation.getFinalPrice() == null) {
            throw new AppException(ErrorCode.QUOTATION_NOT_CALCULATED);
        }

        quotation.setValidUntil(request.getValidUntil());
        quotation.setTermsConditions(request.getTermsConditions());
        quotation.setQuotationDate(LocalDateTime.now());
        quotation.setStatus(QuotationStatus.PENDING); // PENDING = đã gửi cho quản lý duyệt

        Quotation updatedQuotation = quotationRepository.save(quotation);

        // Gửi email cho khách hàng
        try {
            CustomerResponse customer = getCustomerInfo(quotation.getCustomerId());
            emailService.sendQuotationEmail(updatedQuotation, customer);
            log.info("Quotation email sent to customer: {}", customer.getEmail());
        } catch (Exception e) {
            log.error("Failed to send quotation email for quotation: {}", quotationId, e);
            // Không throw exception để tránh ảnh hưởng đến business logic chính
        }

        log.info("Quotation {} sent to customer, valid until: {}", quotationId, request.getValidUntil());
        return mapToResponse(updatedQuotation);
    }

    //  phương thức handleCustomerResponse
    @Override
    public QuotationResponse handleCustomerResponse(UUID quotationId, CustomerResponseRequest request) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

        if (quotation.getStatus() != QuotationStatus.PENDING) { // PENDING = đã gửi cho quản lý duyệt
            throw new AppException(ErrorCode.INVALID_QUOTATION_STATUS);
        }

        if (quotation.getValidUntil() != null && quotation.getValidUntil().isBefore(LocalDateTime.now())) {
            quotation.setStatus(QuotationStatus.EXPIRED);
            quotationRepository.save(quotation);
            throw new AppException(ErrorCode.QUOTATION_EXPIRED);
        }

        // Gửi email dựa trên phản hồi của khách hàng
        try {
            CustomerResponse customer = getCustomerInfo(quotation.getCustomerId());

            if (request.getAccepted()) {
                quotation.setStatus(QuotationStatus.ACCEPTED);
                emailService.sendQuotationAcceptedEmail(quotation, customer);
                log.info("Quotation accepted email sent to customer: {}", customer.getEmail());
            } else {
                quotation.setStatus(QuotationStatus.REJECTED);
                emailService.sendQuotationRejectedEmail(quotation, customer);
                log.info("Quotation rejected email sent to customer: {}", customer.getEmail());
            }
        } catch (Exception e) {
            log.error("Failed to send customer response email for quotation: {}", quotationId, e);
            // Vẫn tiếp tục xử lý business logic chính
            if (request.getAccepted()) {
                quotation.setStatus(QuotationStatus.ACCEPTED);
            } else {
                quotation.setStatus(QuotationStatus.REJECTED);
            }
        }

        Quotation updatedQuotation = quotationRepository.save(quotation);
        return mapToResponse(updatedQuotation);
    }

    // Helper method để lấy thông tin khách hàng
    private CustomerResponse getCustomerInfo(Long customerId) {
        try {
            ApiRespond<CustomerResponse> response = customerClient.getCustomerById(customerId);
            if (response != null && response.getCode().equals("1000") && response.getData() != null) {
                return response.getData();
            }
            throw new AppException(ErrorCode.CUSTOMER_NOT_FOUND);
        } catch (Exception e) {
            log.error("Failed to get customer info for id: {}", customerId, e);
            throw new AppException(ErrorCode.CUSTOMER_SERVICE_UNAVAILABLE);
        }
    }

    @Override
    public SalesOrderB2CResponse convertToSalesOrderB2C(UUID quotationId) {
        log.info("Converting quotation to sales order: {}", quotationId);

        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

        if (quotation.getStatus() != QuotationStatus.ACCEPTED) {
            throw new AppException(ErrorCode.INVALID_QUOTATION_STATUS);
        }

        if (quotation.getSalesOrder() != null) {
            throw new AppException(ErrorCode.SALES_ORDER_ALREADY_EXISTS);
        }

        // Use B2C service for customer orders
        SalesOrderB2CResponse salesOrderResponse = salesOrderServiceB2C.createSalesOrderFromQuotation(quotationId);
        quotation.setStatus(QuotationStatus.COMPLETE);
        quotationRepository.saveAndFlush(quotation);

        // Convert to common response format
        return convertToSalesOrderResponseB2C(salesOrderResponse);
    }

    private SalesOrderB2CResponse convertToSalesOrderResponseB2C(SalesOrderB2CResponse salesOrderB2C) {
        if (salesOrderB2C == null) {
            throw new AppException(ErrorCode.SALES_ORDER_NOT_FOUND);
        }

        SalesOrderB2CResponse response = new SalesOrderB2CResponse();

        response.setOrderId(salesOrderB2C.getOrderId());
        response.setDealerId(salesOrderB2C.getDealerId());
        response.setCustomerId(salesOrderB2C.getCustomerId());
        response.setStaffId(salesOrderB2C.getStaffId());
        response.setOrderDate(salesOrderB2C.getOrderDate());
        response.setDeliveryDate(salesOrderB2C.getDeliveryDate());
        response.setOrderStatusB2C(salesOrderB2C.getOrderStatusB2C());
        response.setTotalAmount(salesOrderB2C.getTotalAmount());
        response.setDownPayment(salesOrderB2C.getDownPayment());
        response.setManagerApproval(salesOrderB2C.getManagerApproval());
        response.setApprovedBy(salesOrderB2C.getApprovedBy());
        response.setTypeOder(salesOrderB2C.getTypeOder());
        response.setApprovalDate(salesOrderB2C.getApprovalDate());

        // Copy thêm các detail object
        response.setQuotation(salesOrderB2C.getQuotation());
        response.setSalesContract(salesOrderB2C.getSalesContract());
        response.setOrderItems(salesOrderB2C.getOrderItems());
        response.setOrderTrackings(salesOrderB2C.getOrderTrackings());

        return response;
    }


    @Override
    public void expireOldQuotations() {
        LocalDateTime now = LocalDateTime.now();
        List<Quotation> expiringQuotations = quotationRepository.findExpiringQuotations(now, now.plusDays(1));

        for (Quotation quotation : expiringQuotations) {
            if (quotation.getValidUntil().isBefore(now)) {
                quotation.setStatus(QuotationStatus.EXPIRED);
                quotationRepository.save(quotation);
                log.info("Quotation {} expired", quotation.getQuotationId());
            }
        }
    }

    // Helper methods
    private boolean isPromotionApplicable(Promotion promotion, Quotation quotation) {
        if (promotion.getStatus() != PromotionStatus.ACTIVE) return false;

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(promotion.getStartDate()) || now.isAfter(promotion.getEndDate())) {
            return false;
        }

        try {
            // 1. Check dealer
            if (promotion.getDealerIdJson() != null && !promotion.getDealerIdJson().isEmpty()) {
                Set<UUID> dealerIds = objectMapper.readValue(
                        promotion.getDealerIdJson(),
                        new TypeReference<Set<UUID>>() {
                        }
                );
                if (!dealerIds.contains(quotation.getDealerId())) {
                    return false;
                }
            }

            // 2. Check model
            if (promotion.getApplicableModelsJson() != null && !promotion.getApplicableModelsJson().isEmpty()) {
                Set<Long> modelIds = objectMapper.readValue(
                        promotion.getApplicableModelsJson(),
                        new TypeReference<Set<Long>>() {
                        }
                );
                if (!modelIds.contains(quotation.getModelId())) {
                    return false;
                }
            }

        } catch (Exception e) {
            return false;
        }

        return true;
    }

    private QuotationResponse mapToResponse(Quotation quotation) {
        QuotationResponse response = modelMapper.map(quotation, QuotationResponse.class);

        // Map promotions một cách an toàn
        if (quotation.getPromotions() != null) {
            // 1. Force load collection từ Hibernate
            Hibernate.initialize(quotation.getPromotions());

            // 2. Copy sang List để tránh ConcurrentModificationException
            List<Promotion> promotions = new ArrayList<>(quotation.getPromotions());

            // 3. Map từng Promotion sang PromotionResponse
            List<PromotionResponse> promotionResponses = promotions.stream()
                    .map(p -> mapPromotionToResponse(p))
                    .collect(Collectors.toList());

            response.setAppliedPromotions(promotionResponses);
        }

        return response;
    }

    private PromotionResponse mapPromotionToResponse(Promotion promotion) {
        PromotionResponse pr = new PromotionResponse();

        // --- Các field cơ bản ---
        pr.setPromotionId(promotion.getPromotionId());
        pr.setPromotionName(promotion.getPromotionName());
        pr.setDescription(promotion.getDescription());
        pr.setDiscountRate(promotion.getDiscountRate());
        pr.setStartDate(promotion.getStartDate());
        pr.setEndDate(promotion.getEndDate());
        pr.setStatus(promotion.getStatus());

        // --- Tính trạng thái ---
        LocalDateTime now = LocalDateTime.now();
        pr.setIsActive(promotion.getStatus() == PromotionStatus.ACTIVE &&
                (promotion.getStartDate() == null || !promotion.getStartDate().isAfter(now)) &&
                (promotion.getEndDate() == null || !promotion.getEndDate().isBefore(now)));
        pr.setIsExpired(promotion.getEndDate() != null && promotion.getEndDate().isBefore(now));
        pr.setIsUpcoming(promotion.getStartDate() != null && promotion.getStartDate().isAfter(now));

        // --- Parse JSON nếu cần ---
        // pr.setApplicableDealers(parseDealerIds(promotion.getDealerIdJson()));
        // pr.setApplicableModels(parseModels(promotion.getApplicableModelsJson()));

        // --- Lấy count quotation áp dụng, tránh vòng lặp ---
        if (promotion.getQuotations() != null) {
            pr.setAppliedQuotationsCount((long) promotion.getQuotations().size());
        } else {
            pr.setAppliedQuotationsCount(0L);
        }

        return pr;
    }


    @Override
    public QuotationResponse getQuotationById(UUID quotationId) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));
        return mapToResponse(quotation);
    }

    @Override
    public void deleteQuotation(UUID quotationId) {
        Quotation quotation = quotationRepository.findById(quotationId)
                .orElseThrow(() -> new AppException(ErrorCode.QUOTATION_NOT_FOUND));

        // Chỉ cho phép xóa các quotation chưa được gửi hoặc đang ở trạng thái DRAFT/PENDING
        if (quotation.getStatus() != QuotationStatus.DRAFT && quotation.getStatus() != QuotationStatus.PENDING) {
            throw new AppException(ErrorCode.INVALID_QUOTATION_STATUS);
        }

        quotationRepository.delete(quotation);
        log.info("Quotation {} deleted successfully", quotationId);
    }

    @Override
    public QuotationFilterRequest buildFilterRequestForStaff(UUID staffId, String status, String customer,
                                                             String dateFrom, String dateTo, String search) {
        QuotationFilterRequest filter = new QuotationFilterRequest();
        filter.setStaffId(staffId);
        parseCommonFilters(filter, status, customer, dateFrom, dateTo, search);
        return filter;
    }

    @Override
    public QuotationFilterRequest buildFilterRequestForDealer(UUID dealerId, String status, String customer,
                                                              String dateFrom, String dateTo, String search) {
        QuotationFilterRequest filter = new QuotationFilterRequest();
        filter.setDealerId(dealerId);
        parseCommonFilters(filter, status, customer, dateFrom, dateTo, search);
        return filter;
    }

    private void parseCommonFilters(QuotationFilterRequest filter, String status, String customer,
                                    String dateFrom, String dateTo, String search) {
        if (status != null && !status.isEmpty()) {
            try {
                filter.setStatus(QuotationStatus.valueOf(status));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status parameter: {}", status);
            }
        }

        if (customer != null && !customer.isEmpty()) {
            try {
                filter.setCustomerId(Long.parseLong(customer));
            } catch (IllegalArgumentException e) {
                log.warn("Invalid customer ID parameter: {}", customer);
            }
        }

        if (dateFrom != null && !dateFrom.isEmpty()) {
            try {
                filter.setStartDate(LocalDate.parse(dateFrom).atStartOfDay());
            } catch (DateTimeParseException e) {
                log.warn("Invalid dateFrom parameter: {}", dateFrom);
            }
        }

        if (dateTo != null && !dateTo.isEmpty()) {
            try {
                filter.setEndDate(LocalDate.parse(dateTo).atTime(23, 59, 59));
            } catch (DateTimeParseException e) {
                log.warn("Invalid dateTo parameter: {}", dateTo);
            }
        }

        if (search != null && !search.isEmpty()) {
            filter.setSearchKeyword(search);
        }
    }

    @Override
    public List<QuotationResponse> getQuotationsByFilters(QuotationFilterRequest filterRequest) {
        Specification<Quotation> spec = Specification.where(null);

        if (filterRequest.getDealerId() != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("dealerId"), filterRequest.getDealerId()));
        }

        if (filterRequest.getStaffId() != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("staffId"), filterRequest.getStaffId()));
        }

        if (filterRequest.getCustomerId() != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("customerId"), filterRequest.getCustomerId()));
        }

        if (filterRequest.getStatus() != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), filterRequest.getStatus()));
        }

        if (filterRequest.getStartDate() != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("quotationDate"), filterRequest.getStartDate()));
        }

        if (filterRequest.getEndDate() != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("quotationDate"), filterRequest.getEndDate()));
        }

        if (filterRequest.getSearchKeyword() != null && !filterRequest.getSearchKeyword().isEmpty()) {
            String pattern = "%" + filterRequest.getSearchKeyword().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("quotationId").as(String.class)), pattern),
                    cb.like(cb.lower(root.get("termsConditions")), pattern)
            ));
        }

        List<Quotation> quotations = quotationRepository.findAll(spec);
        return quotations.stream().map(this::mapToResponse).collect(Collectors.toList());
    }


}