package com.ev.sales_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderFromDepositRequest {

    @NotNull(message = "Record ID is required")
    private UUID recordId; // Payment record ID

    private Long customerId; // Nullable for guest bookings

    private BigDecimal totalAmount;

    @NotNull(message = "Deposit amount is required")
    private BigDecimal depositAmount;

    private UUID dealerId; // Optional: Allow admin to manually select dealer if missing in metadata
}
