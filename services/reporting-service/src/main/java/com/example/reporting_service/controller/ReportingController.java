package com.example.reporting_service.controller;

import com.example.reporting_service.dto.SalesRecordRequest;
import com.example.reporting_service.model.SalesRecord;
import com.example.reporting_service.service.SalesReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportingController {

    private final SalesReportingService salesReportingService;

    @PostMapping("/sales")
    public ResponseEntity<String> reportSale(@RequestBody SalesRecordRequest request) {
        SalesRecord record = SalesRecord.builder()
                .id(request.getOrderId()) // Set ID manually as we removed @GeneratedValue
                .orderId(request.getOrderId())
                .totalAmount(request.getTotalAmount())
                .orderDate(request.getOrderDate() != null ? request.getOrderDate() : LocalDateTime.now())
                .dealerName(request.getDealerName())
                .variantId(request.getVariantId())
                .modelName(request.getModelName())
                .region(request.getRegion())
                .build();
        
        salesReportingService.recordSale(record);
        return ResponseEntity.ok("Sale recorded successfully");
    }

    @GetMapping("/sales/summary")
    public ResponseEntity<List<SalesRecord>> getSalesSummary() {
        return ResponseEntity.ok(salesReportingService.getAllRecords());
    }

    @PostMapping("/forecast")
    public ResponseEntity<Map<String, String>> getForecast(@RequestParam(required = false) String modelName) {
        String forecast = salesReportingService.getDemandForecast(modelName);
        return ResponseEntity.ok(Map.of("forecast", forecast));
    }

    @GetMapping("/forecast/check")
    public ResponseEntity<Map<String, Boolean>> checkForecast(@RequestParam(required = false) String modelName) {
        boolean exists = salesReportingService.checkForecastCache(modelName);
        return ResponseEntity.ok(Map.of("exists", exists));
    }
}
