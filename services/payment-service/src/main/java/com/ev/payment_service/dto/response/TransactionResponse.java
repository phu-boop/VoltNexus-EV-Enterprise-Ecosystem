package com.ev.payment_service.dto.response;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TransactionResponse {
    private UUID transactionId;
    private String paymentMethodName;
    private BigDecimal amount;
    private LocalDateTime transactionDate;
    private String status;
    private String notes;
    private UUID orderId; // Order ID từ PaymentRecord (để hiển thị thông tin đơn hàng)
}