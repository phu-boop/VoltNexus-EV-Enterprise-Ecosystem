package com.example.reporting_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryVelocityDTO {
    // Thông tin định danh
    private String region;
    private Long modelId;
    private String modelName;
    private Long variantId;
    private String variantName;
    
    // Dữ liệu tồn kho
    private Long currentStock;
    
    // Dữ liệu doanh số (ví dụ: 30 ngày qua)
    private Long salesLast30Days;
    
    // Dữ liệu tính toán (Tốc độ tiêu thụ)
    private Double averageDailySales; // Doanh số trung bình ngày
    private Double daysOfSupply; // Số ngày tồn kho (DOS)
}
