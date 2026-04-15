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
import java.util.Map;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/reports/dealer-revenue")
@RequiredArgsConstructor
public class DealerReportController {

    private final SalesRecordRepository salesRecordRepository;

    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER')")
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getDealerRevenueReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
            
        List<SalesRecord> records = salesRecordRepository.findByOrderDateBetween(startDate, endDate);
        
        Map<String, BigDecimal> revenueByDealer = records.stream()
            .collect(Collectors.groupingBy(
                r -> r.getDealerName() != null ? r.getDealerName() : "Unknown",
                Collectors.reducing(BigDecimal.ZERO, 
                    r -> r.getTotalAmount() != null ? r.getTotalAmount() : BigDecimal.ZERO, 
                    BigDecimal::add)
            ));
            
        List<Map<String, Object>> result = revenueByDealer.entrySet().stream()
            .map(e -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("dealerName", e.getKey());
                map.put("totalRevenue", e.getValue());
                return map;
            })
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(result);
    }
}
