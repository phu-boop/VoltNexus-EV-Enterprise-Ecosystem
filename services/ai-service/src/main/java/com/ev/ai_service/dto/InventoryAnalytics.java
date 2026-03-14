package com.ev.ai_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho phân tích tồn kho
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryAnalytics {
    
    private Integer totalInventory; // Tổng tồn kho
    private Integer lowStockVariants; // Số variants tồn kho thấp
    private Integer outOfStockVariants; // Số variants hết hàng
    private Double inventoryTurnover; // Tốc độ quay vòng tồn kho
    private Integer daysOfInventory; // Số ngày tồn kho
}
