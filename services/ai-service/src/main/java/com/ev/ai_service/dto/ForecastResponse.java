package com.ev.ai_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO cho response dự báo
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForecastResponse {
    
    private LocalDate generatedAt;
    private String region;
    private String dealerId;
    private List<ForecastResult> forecasts;
    private ForecastSummary summary;
}
