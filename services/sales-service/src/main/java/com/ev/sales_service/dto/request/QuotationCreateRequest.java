package com.ev.sales_service.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationCreateRequest {
    @NotNull(message = "DEALER_ID_REQUIRED")
    private UUID dealerId;

    @NotNull(message = "CUSTOMER_ID_REQUIRED")
    private Long customerId;

    @NotNull(message = "MODEL_ID_REQUIRED")
    private Long modelId;

    @NotNull(message = "VARIANT_ID_REQUIRED")
    private Long variantId;

    @NotNull(message = "STAFF_ID_REQUIRED")
    private UUID staffId;

    @NotNull(message = "BASE_PRICE_REQUIRED")
    @DecimalMin(value = "0.0", inclusive = false, message = "BASE_PRICE_POSITIVE")
    private BigDecimal basePrice;

    private String termsConditions;
}