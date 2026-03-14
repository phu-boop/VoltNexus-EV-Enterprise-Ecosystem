package com.ev.payment_service.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class DealerInvoiceResponse {
    private UUID dealerInvoiceId;
    private UUID dealerId;
    private UUID createdByStaffId;
    private BigDecimal totalAmount;
    private BigDecimal amountPaid;
    private BigDecimal remainingAmount; // Tính: totalAmount - amountPaid
    private LocalDate dueDate;
    private String status; // UNPAID, PARTIALLY_PAID, PAID, OVERDUE
    private String referenceType;
    private String referenceId;
    private LocalDateTime createdAt;
    private String notes;
    private List<DealerTransactionResponse> transactions; // Danh sách giao dịch của hóa đơn này
}





