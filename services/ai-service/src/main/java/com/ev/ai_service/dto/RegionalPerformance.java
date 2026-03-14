package com.ev.ai_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho hiệu suất theo khu vực
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegionalPerformance {
    
    private String region;
    private Integer totalSales;
    private Integer totalInventory;
    private Integer predictedDemand;
    private String trend; // INCREASING, DECREASING, STABLE
    private Double marketShare; // Thị phần (%)
}
