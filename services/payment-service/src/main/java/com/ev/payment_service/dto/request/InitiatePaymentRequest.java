package com.ev.payment_service.dto.request;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class InitiatePaymentRequest {
    @NotNull(message = "AMOUNT_REQUIRED")
    @DecimalMin(value = "1.00", message = "AMOUNT_INVALID")
    private BigDecimal amount;

    @NotNull(message = "METHOD_ID_REQUIRED")
    private UUID paymentMethodId;

    private UUID planId; // Nullable
    private String notes;
}