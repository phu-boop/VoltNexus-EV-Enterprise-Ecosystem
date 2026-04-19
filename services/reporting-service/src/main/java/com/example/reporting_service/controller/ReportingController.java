package com.example.reporting_service.controller;

import com.example.reporting_service.dto.SalesRecordRequest;
import com.example.reporting_service.model.SalesRecord;
import com.example.reporting_service.service.SalesReportingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportingController {

    private final SalesReportingService salesReportingService;

    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER', 'DEALER_STAFF')")
    @PostMapping("/sales")
    public ResponseEntity<Map<String, String>> reportSale(@Valid @RequestBody SalesRecordRequest request) {
        try {
            SalesRecord record = SalesRecord.builder()
                    .orderId(request.getOrderId())
                    .totalAmount(request.getTotalAmount())
                    .orderDate(request.getOrderDate() != null ? request.getOrderDate() : LocalDateTime.now())
                    .dealerName(request.getDealerName())
                    .variantId(request.getVariantId())
                    .modelName(request.getModelName())
                    .region(request.getRegion())
                    .build();

            salesReportingService.recordSale(record);
            return ResponseEntity.ok(Map.of("message", "Sale recorded successfully"));
        } catch (Exception e) {
            log.error("Failed to record sale for order: {}", request.getOrderId(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Failed to record sale: " + e.getMessage()));
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER', 'DEALER_STAFF')")
    @GetMapping("/sales/summary")
    public ResponseEntity<List<SalesRecord>> getSalesSummary() {
        return ResponseEntity.ok(salesReportingService.getAllRecords());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER')")
    @PostMapping("/forecast")
    public ResponseEntity<Map<String, String>> getForecast(@RequestParam(required = false) String modelName) {
        String forecast = salesReportingService.getDemandForecast(modelName);
        return ResponseEntity.ok(Map.of("forecast", forecast));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER')")
    @GetMapping("/forecast/check")
    public ResponseEntity<Map<String, Boolean>> checkForecast(@RequestParam(required = false) String modelName) {
        boolean exists = salesReportingService.checkForecastCache(modelName);
        return ResponseEntity.ok(Map.of("exists", exists));
    }
}
