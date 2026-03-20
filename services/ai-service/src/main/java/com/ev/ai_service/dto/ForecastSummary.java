package com.ev.ai_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO tóm tắt thông tin dự báo
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForecastSummary {
    
    private Integer totalPredictedDemand;
    private Integer totalCurrentInventory;
    private Integer productionGap; // Chênh lệch cần sản xuất
    private Double averageConfidence;
    private Integer highDemandVariants; // Số variants có nhu cầu cao
    private Integer lowStockVariants; // Số variants tồn kho thấp
    private String overallTrend; // INCREASING, DECREASING, STABLE
}
