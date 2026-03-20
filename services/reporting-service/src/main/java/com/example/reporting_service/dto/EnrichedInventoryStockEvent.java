package com.example.reporting_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrichedInventoryStockEvent {
    
    // Thông tin biến thể/mẫu xe (Yêu cầu EDMS-162)
    private Long variantId;
    private String variantName;
    private Long modelId;
    private String modelName;
    
    // Thông tin vị trí (Yêu cầu EDMS-162)
    private UUID dealerId;
    private String region;
    
    // Tồn kho CẬP NHẬT (Số lượng cuối cùng sau giao dịch)
    private Long stockOnHand; 

    private Long newAvailableQuantity;
    private Long newAllocatedQuantity;
    private Long lastUpdatedAt;
}