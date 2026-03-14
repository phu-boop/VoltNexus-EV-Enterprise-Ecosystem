package com.ev.payment_service.dto.external;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class SalesOrderData {
    private UUID orderId;
    private Long customerId;
    private BigDecimal totalAmount;
    private String orderStatusB2C;
}