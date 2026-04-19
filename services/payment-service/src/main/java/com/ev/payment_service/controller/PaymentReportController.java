package com.ev.payment_service.controller;

import com.ev.payment_service.dto.response.DealerRevenueResponse;
import com.ev.payment_service.dto.response.CustomerDebtSummaryResponse;
import com.ev.payment_service.dto.response.DealerDebtAgingResponse;
import com.ev.payment_service.service.Interface.IPaymentReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Payment Report Controller
 * Cung cấp các API báo cáo cho report-service
 */
@RestController
@RequestMapping("/api/v1/payments/reports")
@RequiredArgsConstructor
@Slf4j
public class PaymentReportController {

    private final IPaymentReportService paymentReportService;

    /**
     * Lấy doanh thu theo đại lý
     * GET /api/v1/payments/reports/revenue-by-dealer
     * Permissions: EVM_STAFF, ADMIN
     */
    @GetMapping("/revenue-by-dealer")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<List<DealerRevenueResponse>> getRevenueByDealer(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        log.info("GET /revenue-by-dealer - StartDate: {}, EndDate: {}", startDate, endDate);

        // Default: 30 ngày gần nhất
        if (startDate == null) {
            startDate = LocalDate.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }

        List<DealerRevenueResponse> response = paymentReportService.getRevenueByDealer(startDate, endDate);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy tổng hợp công nợ khách hàng
     * GET /api/v1/payments/reports/customer-debt-summary
     * Permissions: EVM_STAFF, ADMIN, DEALER_STAFF, DEALER_MANAGER
     */
    @GetMapping("/customer-debt-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<List<CustomerDebtSummaryResponse>> getCustomerDebtSummary() {

        log.info("GET /customer-debt-summary");

        List<CustomerDebtSummaryResponse> response = paymentReportService.getCustomerDebtSummary();
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy báo cáo công nợ đại lý theo độ tuổi (aging)
     * GET /api/v1/payments/reports/dealer-debt-aging
     * Permissions: EVM_STAFF, ADMIN
     */
    @GetMapping("/dealer-debt-aging")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<List<DealerDebtAgingResponse>> getDealerDebtAging() {

        log.info("GET /dealer-debt-aging");

        List<DealerDebtAgingResponse> response = paymentReportService.getDealerDebtAging();
        return ResponseEntity.ok(response);
    }
}


