package com.ev.ai_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO cho kết quả dự báo
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForecastResult {
    
    private Long variantId;
    private String variantName;
    private String modelName;
    private LocalDate forecastDate;
    private Integer predictedDemand;
    private Double confidenceScore;
    private String forecastMethod;
    
    // Thêm thông tin phân tích
    private Integer historicalAverage; // Trung bình lịch sử
    private String trend; // INCREASING, DECREASING, STABLE
    private Integer currentInventory; // Tồn kho hiện tại
    private Integer recommendedStock; // Đề xuất tồn kho
}
