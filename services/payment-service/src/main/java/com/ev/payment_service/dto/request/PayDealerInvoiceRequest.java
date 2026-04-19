package com.ev.payment_service.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PayDealerInvoiceRequest {
    
    @NotNull(message = "AMOUNT_REQUIRED")
    @DecimalMin(value = "1.00", message = "AMOUNT_INVALID")
    private BigDecimal amount;
    
    @NotNull(message = "METHOD_ID_REQUIRED")
    private UUID paymentMethodId;
    
    private String transactionCode; // Mã giao dịch ngân hàng (để đối soát)
    
    private LocalDateTime paidDate; // Ngày đại lý chuyển tiền (nếu không có thì dùng thời gian hiện tại)
    
    private String notes; // Ghi chú của Đại lý
}





