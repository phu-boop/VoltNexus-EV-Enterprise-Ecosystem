package com.ev.dealer_service.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DealerContractRequest {

    @NotNull(message = "Dealer ID is required")
    private UUID dealerId;

    @NotBlank(message = "Contract number is required")
    @Size(max = 100, message = "Contract number must not exceed 100 characters")
    private String contractNumber;

    private String contractTerms;

    @DecimalMin(value = "0.0", inclusive = false, message = "Target sales must be greater than 0")
    private BigDecimal targetSales;

    @DecimalMin(value = "0.0", message = "Commission rate must be at least 0")
    private BigDecimal commissionRate;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @Size(max = 20, message = "Contract status must not exceed 20 characters")
    private String contractStatus;
}
