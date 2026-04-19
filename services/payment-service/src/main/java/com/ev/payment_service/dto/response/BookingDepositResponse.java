package com.ev.payment_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDepositResponse {
    private UUID recordId;
    private UUID orderId;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private BigDecimal totalAmount;
    private BigDecimal amountPaid;
    private BigDecimal remainingAmount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Transaction info
    private UUID transactionId;
    private String gatewayTransactionId;
    private String paymentMethodName;
    private String orderInfo;
    private String metadata;
}
