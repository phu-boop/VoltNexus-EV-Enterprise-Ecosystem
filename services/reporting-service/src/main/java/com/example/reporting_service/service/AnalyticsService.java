package com.example.reporting_service.service;

import com.example.reporting_service.model.InventorySummaryByRegion;
import com.example.reporting_service.model.SalesRecord;
import com.example.reporting_service.repository.InventorySummaryRepository;
import com.example.reporting_service.repository.SalesRecordRepository;
import com.example.reporting_service.repository.DealerCacheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class AnalyticsService {
    
    private final SalesRecordRepository salesRecordRepository;
    private final InventorySummaryRepository inventorySummaryRepository;
    private final DealerCacheRepository dealerCacheRepository;

    public Map<String, Object> computeSalesKpis() {
        List<SalesRecord> records = salesRecordRepository.findAll();
        long totalOrders = records.size();
        BigDecimal totalRevenue = records.stream()
            .map(r -> r.getTotalAmount() != null ? r.getTotalAmount() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal aov = totalOrders > 0 ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO;
        
        return Map.of(
            "totalOrders", totalOrders,
            "totalRevenue", totalRevenue,
            "averageOrderValue", aov
        );
    }
    
    public Map<String, Object> computeInventoryKpis() {
        List<InventorySummaryByRegion> inventories = inventorySummaryRepository.findAll();
        long totalStock = inventories.stream().mapToLong(i -> i.getTotalStock() != null ? i.getTotalStock() : 0L).sum();
        
        long lowStockNodesCount = inventories.stream().filter(i -> i.getTotalStock() != null && i.getTotalStock() < 5).count();
        
        return Map.of(
            "totalStock", totalStock,
            "lowStockWarningNodes", lowStockNodesCount
        );
    }
    
    public Map<String, Object> getEvmOpsDashboardSummary() {
        Map<String, Object> kpis = new HashMap<>();
        
        // Dealers
        kpis.put("totalDealersActive", dealerCacheRepository.count());
        
        // Sales
        Map<String, Object> salesKpi = computeSalesKpis();
        kpis.put("totalOrders", salesKpi.get("totalOrders"));
        kpis.put("totalRevenue", salesKpi.get("totalRevenue"));
        
        // Mocked remaining Evm Ops Data (as stated in implementation plan)
        kpis.put("totalCustomers", 1250);
        kpis.put("b2bOrdersCount", 45);
        kpis.put("b2cOrdersCount", salesKpi.get("totalOrders")); 
        kpis.put("outstandingDebt", new BigDecimal("5000000.00")); // Mock debt
        
        return kpis;
    }
}
