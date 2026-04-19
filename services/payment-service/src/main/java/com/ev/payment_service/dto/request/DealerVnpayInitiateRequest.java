package com.ev.payment_service.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Request body dùng khi Dealer Manager khởi tạo thanh toán VNPAY cho hóa đơn B2B.
 */
@Data
public class DealerVnpayInitiateRequest {

    @NotNull(message = "AMOUNT_REQUIRED")
    @DecimalMin(value = "1.00", message = "AMOUNT_INVALID")
    private BigDecimal amount;

    /**
     * URL frontend để VNPAY redirect về sau khi thanh toán.
     * Nếu không gửi, backend sẽ dùng default trong cấu hình.
     */
    private String returnUrl;
}
