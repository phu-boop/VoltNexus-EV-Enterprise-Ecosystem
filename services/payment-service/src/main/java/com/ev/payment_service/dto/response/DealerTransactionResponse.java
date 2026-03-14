package com.ev.payment_service.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class DealerTransactionResponse {
    private UUID dealerTransactionId;
    private UUID dealerInvoiceId;
    private BigDecimal amount;
    private LocalDateTime transactionDate;
    private String paymentMethodName;
    private String transactionCode;
    private String status; // PENDING_CONFIRMATION, SUCCESS, FAILED
    private UUID confirmedByStaffId;
    private String notes;
}





