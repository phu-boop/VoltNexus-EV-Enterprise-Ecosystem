package com.ev.ai_service.service;

import com.ev.ai_service.dto.*;
import com.ev.ai_service.entity.SalesHistory;
import com.ev.ai_service.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for Dashboard Analytics
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {
    
    private final SalesHistoryRepository salesHistoryRepository;
    private final InventorySnapshotRepository inventorySnapshotRepository;
    private final DemandForecastRepository forecastRepository;
    
    /**
     * Lấy dashboard analytics
     */
    public DashboardDto getDashboard(int daysBack) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(daysBack);
        
        // Sales Analytics
        SalesAnalytics salesAnalytics = calculateSalesAnalytics(startDate, endDate);
        
        // Inventory Analytics
        InventoryAnalytics inventoryAnalytics = calculateInventoryAnalytics();
        
        // Top Demand Forecasts - Not implemented yet, return empty
        List<ForecastResult> topForecasts = new ArrayList<>();
        
        // Regional Performance
        List<RegionalPerformance> regionalPerformances = 
            calculateRegionalPerformance(startDate, endDate);
        
        return DashboardDto.builder()
            .salesAnalytics(salesAnalytics)
            .inventoryAnalytics(inventoryAnalytics)
            .topDemandForecasts(topForecasts)
            .regionalPerformances(regionalPerformances)
            .build();
    }
    
    /**
     * Tính toán sales analytics
     */
    private SalesAnalytics calculateSalesAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        List<SalesHistory> histories = salesHistoryRepository
            .findByRegionAndSaleDateBetween(null, startDate, endDate);
        
        int totalSales = histories.stream()
            .mapToInt(SalesHistory::getQuantity)
            .sum();
        
        BigDecimal totalRevenue = histories.stream()
            .map(SalesHistory::getTotalAmount)
            .filter(amount -> amount != null)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        int totalOrders = (int) histories.stream()
            .map(SalesHistory::getOrderId)
            .distinct()
            .count();
        
        double avgOrderValue = totalOrders > 0 ? 
            totalRevenue.doubleValue() / totalOrders : 0.0;
        
        // Top selling variant
        List<Object[]> topVariants = salesHistoryRepository
            .getTopSellingVariants(startDate, endDate);
        
        String topSellingVariant = topVariants.isEmpty() ? 
            "N/A" : topVariants.get(0)[1].toString();
        
        return SalesAnalytics.builder()
            .totalSales(totalSales)
            .totalRevenue(totalRevenue)
            .totalOrders(totalOrders)
            .averageOrderValue(avgOrderValue)
            .monthOverMonthGrowth(0) // TODO: Calculate MoM growth
            .topSellingVariant(topSellingVariant)
            .build();
    }
    
    /**
     * Tính toán inventory analytics
     */
    private InventoryAnalytics calculateInventoryAnalytics() {
        Integer totalInventory = inventorySnapshotRepository.getCurrentTotalInventory();
        
        return InventoryAnalytics.builder()
            .totalInventory(totalInventory != null ? totalInventory : 0)
            .lowStockVariants(0) // TODO: Calculate
            .outOfStockVariants(0) // TODO: Calculate
            .inventoryTurnover(0.0) // TODO: Calculate
            .daysOfInventory(0) // TODO: Calculate
            .build();
    }
    
    /**
     * Tính toán regional performance
     */
    private List<RegionalPerformance> calculateRegionalPerformance(
        LocalDateTime startDate, 
        LocalDateTime endDate
    ) {
        List<RegionalPerformance> performances = new ArrayList<>();
        
        List<Object[]> salesByRegion = salesHistoryRepository
            .getSalesByRegion(startDate, endDate);
        
        List<Object[]> inventoryByRegion = inventorySnapshotRepository
            .getCurrentInventoryByRegion();
        
        for (Object[] row : salesByRegion) {
            String region = (String) row[0];
            Integer totalSales = ((Number) row[1]).intValue();
            
            // Find inventory for this region
            Integer inventory = inventoryByRegion.stream()
                .filter(inv -> region.equals(inv[0]))
                .findFirst()
                .map(inv -> ((Number) inv[1]).intValue())
                .orElse(0);
            
            performances.add(RegionalPerformance.builder()
                .region(region)
                .totalSales(totalSales)
                .totalInventory(inventory)
                .predictedDemand(0) // TODO: Get from forecast
                .trend("STABLE") // TODO: Calculate
                .marketShare(0.0) // TODO: Calculate
                .build());
        }
        
        return performances;
    }
}
