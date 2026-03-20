package com.ev.payment_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO cho Payment Record (quản lý admin)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRecordResponse {

    private UUID recordId;
    private UUID orderId;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private BigDecimal totalAmount;
    private BigDecimal amountPaid;
    private BigDecimal remainingAmount;
    private String status; // PENDING_DEPOSIT, PROCESSING, COMPLETED, FAILED, CANCELLED
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Payment plan info (nếu có)
    private UUID planId;
    private String planName;
    private Integer numberOfInstallments;
    private BigDecimal monthlyPayment;
}
