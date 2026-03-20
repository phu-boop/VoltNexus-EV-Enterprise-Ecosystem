package com.ev.sales_service.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// QuotationSendRequest.java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotationSendRequest {
    @NotNull(message = "Customer ID is required")
    private Long customerId;
    @NotNull(message = "VALID_UNTIL_REQUIRED")
    @Future(message = "VALID_UNTIL_FUTURE")
    private LocalDateTime validUntil;

    @NotBlank(message = "TERMS_CONDITIONS_REQUIRED")
    private String termsConditions;
}