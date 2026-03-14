package com.ev.payment_service.dto.response;
import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class InitiatePaymentResponse {
    private UUID transactionId;
    private String status; // PENDING_CONFIRMATION hoặc PENDING_GATEWAY
    private String paymentUrl; // Nullable, chỉ cho VNPAY
    private String message;
}