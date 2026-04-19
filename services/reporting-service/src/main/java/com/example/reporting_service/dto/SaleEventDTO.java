package com.example.reporting_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.sql.Timestamp;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaleEventDTO {
    private String orderId;
    private Long modelId;
    private String modelName;
    private Long variantId;
    private String variantName;
    private String region;
    
    // Thông tin quan trọng cho Feature 1
    private UUID dealershipId; 
    private String dealershipName;
    
    private Long quantitySold; // Thường là 1
    private Double salePrice; // Tổng tiền bán
    private Timestamp saleTimestamp; // Thời gian bán
}
