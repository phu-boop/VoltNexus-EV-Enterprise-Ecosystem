package com.ev.ai_service.controller;

import com.ev.ai_service.dto.DashboardDto;
import com.ev.ai_service.service.AnalyticsService;
import com.ev.common_lib.dto.respond.ApiRespond;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST API Controller cho Analytics Dashboard
 */
@RestController
@RequestMapping("/api/ai/analytics")
@RequiredArgsConstructor
@Slf4j
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * Lấy dashboard analytics
     * GET /api/ai/analytics/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiRespond<DashboardDto>> getDashboard(
            @RequestParam(defaultValue = "30") int daysBack) {
        log.info("Getting dashboard analytics for last {} days", daysBack);

        try {
            DashboardDto dashboard = analyticsService.getDashboard(daysBack);
            return ResponseEntity.ok(
                    ApiRespond.success("Dashboard retrieved successfully", dashboard));
        } catch (Exception e) {
            log.error("Error getting dashboard: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                    ApiRespond.error("ERROR", e.getMessage(), null));
        }
    }
}
