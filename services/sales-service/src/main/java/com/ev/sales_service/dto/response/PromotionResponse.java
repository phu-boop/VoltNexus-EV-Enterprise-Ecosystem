package com.ev.sales_service.dto.response;


import com.ev.sales_service.enums.PromotionStatus;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionResponse {
    private UUID promotionId;
    private String promotionName;
    private String description;
    private BigDecimal discountRate;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private PromotionStatus status;

    // Parsed from JSON fields
    private List<UUID> applicableDealers;  // Parse từ dealer_id_json
    private List<Long> applicableModels;   // Parse từ applicable_models_json

    // Additional computed fields for frontend
    private Boolean isActive;              // Computed: status=ACTIVE và trong thời gian hiệu lực
    private Boolean isExpired;             // Computed: endDate < now
    private Boolean isUpcoming;            // Computed: startDate > now
    private Long appliedQuotationsCount;   // Số lượng quotation đã áp dụng promotion này
}