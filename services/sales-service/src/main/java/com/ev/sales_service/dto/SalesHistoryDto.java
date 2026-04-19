package com.ev.sales_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO để trả về sales history cho AI Service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesHistoryDto {
    private UUID orderId;
    private Long variantId;
    private UUID dealerId;
    private String region;
    private Integer quantity;
    private BigDecimal totalAmount;
    private BigDecimal unitPrice;
    private LocalDateTime orderDate;
    private String orderStatus;
    private String modelName;
    private String variantName;
}
