package com.ev.sales_service.mapper;

import com.ev.sales_service.dto.request.PromotionRequest;
import com.ev.sales_service.dto.response.PromotionResponse;
import com.ev.sales_service.entity.Promotion;
import com.ev.sales_service.enums.PromotionStatus;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PromotionMapper {

    private final ObjectMapper objectMapper;

    public Promotion toEntity(PromotionRequest request) {
        if (request == null)
            return null;

        Promotion promotion = Promotion.builder()
                .promotionName(request.getPromotionName())
                .description(request.getDescription())
                .discountRate(request.getDiscountRate())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus())
                .build();

        try {
            if (request.getApplicableDealers() != null) {
                promotion.setDealerIdJson(objectMapper.writeValueAsString(request.getApplicableDealers()));
            }
            if (request.getApplicableModels() != null) {
                promotion.setApplicableModelsJson(objectMapper.writeValueAsString(request.getApplicableModels()));
            }
        } catch (Exception e) {
            // Handle serialization error if needed
        }

        return promotion;
    }

    public PromotionResponse toResponse(Promotion promotion) {
        if (promotion == null)
            return null;

        PromotionResponse response = PromotionResponse.builder()
                .promotionId(promotion.getPromotionId())
                .promotionName(promotion.getPromotionName())
                .description(promotion.getDescription())
                .discountRate(promotion.getDiscountRate())
                .startDate(promotion.getStartDate())
                .endDate(promotion.getEndDate())
                .status(promotion.getStatus())
                .build();

        // Parse JSON fields
        try {
            if (promotion.getDealerIdJson() != null && !promotion.getDealerIdJson().isEmpty()) {
                response.setApplicableDealers(
                        objectMapper.readValue(promotion.getDealerIdJson(), new TypeReference<List<String>>() {
                        }));
            } else {
                response.setApplicableDealers(Collections.emptyList());
            }

            if (promotion.getApplicableModelsJson() != null && !promotion.getApplicableModelsJson().isEmpty()) {
                response.setApplicableModels(
                        objectMapper.readValue(promotion.getApplicableModelsJson(), new TypeReference<List<String>>() {
                        }));
            } else {
                response.setApplicableModels(Collections.emptyList());
            }
        } catch (Exception e) {
            response.setApplicableDealers(Collections.emptyList());
            response.setApplicableModels(Collections.emptyList());
        }

        // Computed fields
        LocalDateTime now = LocalDateTime.now();
        response.setIsActive(promotion.getStatus() == PromotionStatus.ACTIVE
                && (promotion.getStartDate() == null || promotion.getStartDate().isBefore(now))
                && (promotion.getEndDate() == null || promotion.getEndDate().isAfter(now)));
        response.setIsExpired(promotion.getEndDate() != null && promotion.getEndDate().isBefore(now));
        response.setIsUpcoming(promotion.getStartDate() != null && promotion.getStartDate().isAfter(now));
        response.setAppliedQuotationsCount(
                promotion.getQuotations() != null ? (long) promotion.getQuotations().size() : 0L);

        return response;
    }

    public List<PromotionResponse> toResponseList(List<Promotion> promotions) {
        if (promotions == null)
            return Collections.emptyList();
        return promotions.stream().map(this::toResponse).collect(Collectors.toList());
    }
}
