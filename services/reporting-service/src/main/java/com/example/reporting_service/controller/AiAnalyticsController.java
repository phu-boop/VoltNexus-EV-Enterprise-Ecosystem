package com.example.reporting_service.controller;

import com.example.reporting_service.service.AnalyticsService;
import com.example.reporting_service.service.GeminiForecastingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/reports/ai-analytics")
@RequiredArgsConstructor
public class AiAnalyticsController {

    private final AnalyticsService analyticsService;
    private final GeminiForecastingService geminiForecastingService;

    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    @GetMapping("/dashboard-summary")
    public ResponseEntity<Map<String, String>> getAiAnalyticsDashboardSummary() {
        Map<String, Object> salesKpis = analyticsService.computeSalesKpis();
        Map<String, Object> inventoryKpis = analyticsService.computeInventoryKpis();
        
        String promptContext = String.format(
            "Phân tích dữ liệu vận hành sau đây và tóm tắt phân tích (Dashboard Insight): " +
            "Tổng đơn: %s, Tổng doanh thu: %s, Trung bình đơn: %s. " +
            "Tồn kho hệ thống: %s, Số điểm (Node) đang bị cảnh báo cạn kho (Low Stock warning): %s. " +
            "Hãy chỉ ra các rủi ro, xu hướng tích cực và cảnh báo hành động cần làm ngay.",
            salesKpis.get("totalOrders"), salesKpis.get("totalRevenue"), salesKpis.get("averageOrderValue"),
            inventoryKpis.get("totalStock"), inventoryKpis.get("lowStockWarningNodes")
        );
        
        String insight = geminiForecastingService.generateForecast(promptContext, "Evm Ops Dashboard");
        
        return ResponseEntity.ok(Map.of("aiSummary", insight));
    }
}
