package com.ev.sales_service.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class OrderItemResponse {
    private UUID orderItemId;
    private Long variantId;
    private String variantName;
    private String modelName;
    private String color;
    private String imageUrl;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal discount;
    private BigDecimal finalPrice;
    private BigDecimal price; // Alias for finalPrice to match frontend expectation
}