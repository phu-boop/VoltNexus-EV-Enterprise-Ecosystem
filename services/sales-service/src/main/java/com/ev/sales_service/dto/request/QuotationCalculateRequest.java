package com.ev.sales_service.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationCalculateRequest {
    private List<UUID> promotionIds;

    @DecimalMax(value = "100.0", message = "DISCOUNT_RATE_MAX")
    @DecimalMin(value = "0.0", message = "DISCOUNT_RATE_MIN")
    private BigDecimal additionalDiscountRate;
}