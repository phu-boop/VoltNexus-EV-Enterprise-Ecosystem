package com.example.reporting_service.controller;

import com.example.reporting_service.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/reports/dashboards")
@RequiredArgsConstructor
public class EvmDashboardController {

    private final AnalyticsService analyticsService;

    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    @GetMapping("/evm-ops")
    public ResponseEntity<Map<String, Object>> getEvmOpsDashboardSummary() {
        return ResponseEntity.ok(analyticsService.getEvmOpsDashboardSummary());
    }
}
