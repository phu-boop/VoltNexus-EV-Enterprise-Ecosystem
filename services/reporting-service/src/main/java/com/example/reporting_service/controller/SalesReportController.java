package com.example.reporting_service.controller;

import com.example.reporting_service.model.SalesRecord;
import com.example.reporting_service.repository.SalesRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reports/sales/history")
@RequiredArgsConstructor
public class SalesReportController {

    private final SalesRecordRepository salesRecordRepository;

    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER')")
    @GetMapping
    public ResponseEntity<List<SalesRecord>> listSalesHistory(
            @RequestParam(required = false) String dealership,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
            
        if (startDate == null) startDate = LocalDateTime.now().minusYears(1);
        if (endDate == null) endDate = LocalDateTime.now();
        
        List<SalesRecord> records;
        if (dealership != null && !dealership.isEmpty()) {
            records = salesRecordRepository.findByDealerNameAndOrderDateBetween(dealership, startDate, endDate);
        } else {
            records = salesRecordRepository.findByOrderDateBetween(startDate, endDate);
        }
            
        return ResponseEntity.ok(records);
    }
}
