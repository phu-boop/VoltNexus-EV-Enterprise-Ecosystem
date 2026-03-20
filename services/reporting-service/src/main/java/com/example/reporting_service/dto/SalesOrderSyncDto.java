package com.example.reporting_service.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class SalesOrderSyncDto {
    private UUID orderId;
    private BigDecimal totalAmount;
    private LocalDateTime orderDate; // Check mapped name "createdAt" or "orderDate"
    private UUID dealerId;
    private List<OrderItemSyncDto> orderItems;
    private String region; // Assuming response might have it or we infer

    @Data
    public static class OrderItemSyncDto {
        private String modelName;
        private Long variantId;
    }
}
