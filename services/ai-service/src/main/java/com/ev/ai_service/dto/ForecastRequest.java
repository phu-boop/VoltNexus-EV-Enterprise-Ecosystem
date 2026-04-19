package com.ev.ai_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO cho request dự báo nhu cầu
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForecastRequest {
    
    private Long variantId; // null = dự báo tất cả variants
    private String dealerId; // null = dự báo toàn quốc
    private String region; // null = dự báo toàn quốc
    private LocalDate startDate;
    private LocalDate endDate;
    private String forecastMethod; // MOVING_AVERAGE, LINEAR_REGRESSION, AUTO
    private Integer daysToForecast; // Số ngày cần dự báo (mặc định 30)
    
    // Filters
    private List<Long> variantIds; // Danh sách variants cần dự báo
}
