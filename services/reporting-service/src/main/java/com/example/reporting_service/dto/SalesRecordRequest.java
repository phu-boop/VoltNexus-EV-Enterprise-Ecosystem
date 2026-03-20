package com.example.reporting_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesRecordRequest {
    private UUID orderId;
    private BigDecimal totalAmount;
    private LocalDateTime orderDate;
    private String dealerName;
    private Long variantId;
    private String modelName;
    private String region;
}
