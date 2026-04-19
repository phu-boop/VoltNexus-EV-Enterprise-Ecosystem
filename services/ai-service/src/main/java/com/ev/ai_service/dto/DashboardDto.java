package com.ev.ai_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO cho Dashboard Analytics
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardDto {
    
    // Sales Analytics
    private SalesAnalytics salesAnalytics;
    
    // Inventory Analytics
    private InventoryAnalytics inventoryAnalytics;
    
    // Forecast Summary
    private List<ForecastResult> topDemandForecasts;
    
    // Regional Performance
    private List<RegionalPerformance> regionalPerformances;
}
