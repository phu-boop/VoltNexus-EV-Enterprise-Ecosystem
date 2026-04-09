package com.example.reporting_service.controller;

import com.example.reporting_service.service.SalesReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/sync")
@RequiredArgsConstructor
public class SyncController {

    private final SalesReportingService salesReportingService;

    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    @PostMapping("/sales")
    public ResponseEntity<Map<String, String>> syncSalesData() {
        salesReportingService.syncSalesData();
        return ResponseEntity.ok(Map.of("message", "Sales data synchronization completed successfully."));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    @PostMapping("/inventory")
    public ResponseEntity<Map<String, String>> syncInventoryData() {
        salesReportingService.syncInventoryData();
        return ResponseEntity.ok(Map.of("message", "Inventory data synchronization completed successfully."));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    @PostMapping("/metadata")
    public ResponseEntity<Map<String, String>> syncMetadata() {
        salesReportingService.syncMetadata();
        return ResponseEntity.ok(Map.of("message", "Metadata synchronization (connectivity check) completed."));
    }
}
