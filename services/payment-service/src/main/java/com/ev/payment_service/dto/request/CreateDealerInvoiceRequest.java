package com.ev.payment_service.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateDealerInvoiceRequest {
    
    @NotNull(message = "ORDER_ID_REQUIRED")
    private UUID orderId; // Order ID từ sales_db (phải là B2B)
    
    @NotNull(message = "DEALER_ID_REQUIRED")
    private UUID dealerId;
    
    @NotNull(message = "AMOUNT_REQUIRED")
    @DecimalMin(value = "1.00", message = "AMOUNT_INVALID")
    private BigDecimal amount;
    
    @NotNull(message = "DUE_DATE_REQUIRED")
    @FutureOrPresent(message = "DUE_DATE_FUTURE")
    private LocalDate dueDate;
    
    private String referenceType; // e.g., "VEHICLE_SHIPMENT", "SALES_ORDER_B2B"
    
    private String referenceId; // e.g., ID của lô hàng, ID của đơn hàng B2B
    
    private String notes;
}



