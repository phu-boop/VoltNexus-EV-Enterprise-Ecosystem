package com.ev.sales_service.controller;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.sales_service.dto.SalesHistoryDto;
import com.ev.sales_service.service.SalesAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * API cho AI Service để lấy dữ liệu sales history
 */
@RestController
@RequestMapping("/api/sales/analytics")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = { "${app.cors.allowed-origins:http://localhost:3000}",
        "${app.cors.allowed-origins:http://localhost:8080}" })
public class SalesAnalyticsController {

    private final SalesAnalyticsService analyticsService;

    /**
     * Lấy sales history cho AI forecasting
     * Endpoint này được gọi từ AI Service
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    @GetMapping("/history")
    public ResponseEntity<ApiRespond<List<SalesHistoryDto>>> getSalesHistory(
            @RequestParam(required = false) Long variantId,
            @RequestParam(required = false) UUID dealerId,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "100") int limit) {
        log.info("📊 AI Service requesting sales history - variantId: {}, dealerId: {}, startDate: {}, endDate: {}",
                variantId, dealerId, startDate, endDate);

        // Default: lấy 60 ngày gần nhất
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        if (startDate == null) {
            startDate = endDate.minusDays(60);
        }

        List<SalesHistoryDto> history = analyticsService.getSalesHistory(
                variantId, dealerId, region, startDate, endDate, limit);

        log.info("✅ Returned {} sales records to AI Service", history.size());

        return ResponseEntity.ok(
                ApiRespond.success("Sales history retrieved successfully", history));
    }

    /**
     * Lấy sales summary theo variant
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    @GetMapping("/summary/by-variant")
    public ResponseEntity<ApiRespond<List<SalesHistoryDto>>> getSalesSummaryByVariant(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.info("📊 AI Service requesting sales summary by variant");

        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        if (startDate == null) {
            startDate = endDate.minusDays(60);
        }

        List<SalesHistoryDto> summary = analyticsService.getSalesSummaryByVariant(startDate, endDate);

        log.info("✅ Returned summary for {} variants", summary.size());

        return ResponseEntity.ok(
                ApiRespond.success("Sales summary retrieved successfully", summary));
    }
}
