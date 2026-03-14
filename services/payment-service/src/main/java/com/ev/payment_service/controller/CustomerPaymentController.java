package com.ev.payment_service.controller;

import com.ev.payment_service.dto.request.InitiatePaymentRequest;
import com.ev.payment_service.dto.response.InitiatePaymentResponse;
import com.ev.payment_service.dto.response.PaymentRecordResponse;
import com.ev.payment_service.dto.response.PaymentStatisticsResponse;
import com.ev.payment_service.dto.response.TransactionResponse;
import com.ev.payment_service.repository.PaymentRecordRepository;
import com.ev.payment_service.service.Interface.ICustomerPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.ev.payment_service.config.UserPrincipal;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments/customer") // Khớp với Gateway
@RequiredArgsConstructor
@Slf4j
public class CustomerPaymentController {

        private final ICustomerPaymentService customerPaymentService;
        private final PaymentRecordRepository paymentRecordRepository;

        /**
         * API 1: Khởi tạo thanh toán
         * Giai đoạn 2: CUSTOMER, DEALER_STAFF, DEALER_MANAGER
         */
        @PostMapping("/orders/{orderId}/pay")
        @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER', 'DEALER_STAFF', 'DEALER_MANAGER')")
        public ResponseEntity<InitiatePaymentResponse> initiatePayment(
                        @PathVariable UUID orderId,
                        @Valid @RequestBody InitiatePaymentRequest request,
                        @AuthenticationPrincipal UserPrincipal principal) { // << ĐỔI sang UserPrincipal

                log.info("[CustomerPaymentController] POST /orders/{}/pay - Request: amount={}, paymentMethodId={}, notes={}",
                                orderId, request.getAmount(), request.getPaymentMethodId(), request.getNotes());
                log.info("[CustomerPaymentController] UserPrincipal - Email: {}, Role: {}, ProfileId: {}",
                                principal != null ? principal.getEmail() : "null",
                                principal != null ? principal.getRole() : "null",
                                principal != null ? principal.getProfileId() : "null");

                try {
                        InitiatePaymentResponse response = customerPaymentService.initiatePayment(
                                        orderId, request, principal.getEmail(), principal.getProfileId());
                        log.info("[CustomerPaymentController] Payment initiated successfully - TransactionId: {}",
                                        response.getTransactionId());
                        return new ResponseEntity<>(response, HttpStatus.CREATED);
                } catch (Exception e) {
                        log.error("[CustomerPaymentController] Error initiating payment for orderId: {}", orderId, e);
                        throw e;
                }
        }

        /**
         * API 2: Xác nhận thanh toán (thủ công)
         */
        @PostMapping("/transactions/{transactionId}/confirm")
        @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER', 'ADMIN')")
        public ResponseEntity<TransactionResponse> confirmManualPayment(
                        @PathVariable UUID transactionId,
                        @RequestBody(required = false) java.util.Map<String, String> request,
                        @AuthenticationPrincipal UserPrincipal principal) {

                String notes = request != null ? request.get("notes") : null;
                String action = request != null ? request.get("action") : "APPROVE"; // Default to APPROVE

                TransactionResponse response = customerPaymentService.confirmManualPayment(
                                transactionId, principal.getEmail(), principal.getProfileId(), notes, action);
                return ResponseEntity.ok(response);
        }

        /**
         * API 3.1: Lấy lịch sử thanh toán của một đơn hàng
         * Giai đoạn 2: CUSTOMER, DEALER_STAFF+ (DEALER_STAFF, DEALER_MANAGER, ADMIN)
         */
        @GetMapping("/orders/{orderId}/history")
        @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER', 'DEALER_STAFF', 'DEALER_MANAGER')")
        public ResponseEntity<List<TransactionResponse>> getPaymentHistory(
                        @PathVariable UUID orderId) {

                return ResponseEntity.ok(customerPaymentService.getPaymentHistory(orderId));
        }

        /**
         * API 3.2: Lấy tổng công nợ của một khách hàng
         * Giai đoạn 2: DEALER_STAFF+ (DEALER_STAFF, DEALER_MANAGER, ADMIN)
         */
        @GetMapping("/{customerId}/debt")
        @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_STAFF', 'DEALER_MANAGER')")
        public ResponseEntity<BigDecimal> getCustomerTotalDebt(
                        @PathVariable Long customerId) {

                BigDecimal totalDebt = customerPaymentService.getCustomerTotalDebt(customerId);
                return ResponseEntity.ok(totalDebt);
        }

        /**
         * API 4: Lấy danh sách thanh toán tiền mặt chờ duyệt (B2C orders) - Dealer
         * Manager
         */
        @GetMapping("/pending-cash-payments-b2c")
        @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_MANAGER')")
        public ResponseEntity<Page<TransactionResponse>> getPendingCashPaymentsB2C(
                        @PageableDefault(size = 10, sort = "transactionDate") Pageable pageable,
                        @AuthenticationPrincipal UserPrincipal principal) {

                log.info("[CustomerPaymentController] GET /pending-cash-payments-b2c");
                log.info("[CustomerPaymentController] UserPrincipal - Email: {}, Role: {}, ProfileId: {}",
                                principal != null ? principal.getEmail() : "null",
                                principal != null ? principal.getRole() : "null",
                                principal != null ? principal.getProfileId() : "null");

                Page<TransactionResponse> response = customerPaymentService.getPendingCashPaymentsB2C(pageable);
                return ResponseEntity.ok(response);
        }

        @GetMapping("/debug-me")
        public ResponseEntity<?> debugMe(@AuthenticationPrincipal UserPrincipal principal) {
                // API này sẽ trả về chính xác những gì Spring Security "biết" về bạn
                return ResponseEntity.ok(principal);
        }

        /**
         * API 5: Lấy danh sách payment records với filter (Admin)
         */
        @GetMapping("/records")
        @PreAuthorize("hasAuthority('ROLE_ADMIN')")
        public ResponseEntity<Page<PaymentRecordResponse>> filterPaymentRecords(
                        @RequestParam(required = false) String status,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
                        @RequestParam(required = false) UUID orderId,
                        @RequestParam(required = false) Long customerId,
                        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

                log.info(
                                "[CustomerPaymentController] GET /records - Filters: status={}, startDate={}, endDate={}, orderId={}, customerId={}",
                                status, startDate, endDate, orderId, customerId);

                Page<PaymentRecordResponse> records = customerPaymentService.filterPaymentRecords(
                                status, startDate, endDate, orderId, customerId, pageable);

                return ResponseEntity.ok(records);
        }

        /**
         * API 6: Lấy thống kê payment (Admin)
         */
        @GetMapping("/statistics")
        @PreAuthorize("hasAuthority('ROLE_ADMIN')")
        public ResponseEntity<PaymentStatisticsResponse> getPaymentStatistics(
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
                        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

                log.info("[CustomerPaymentController] GET /statistics - startDate={}, endDate={}", startDate, endDate);

                PaymentStatisticsResponse stats = customerPaymentService.getPaymentStatistics(startDate, endDate);

                return ResponseEntity.ok(stats);
        }
        /**
         * API 7: Lấy danh sách booking deposit của customer đang đăng nhập
         * Hiển thị các đơn đặt cọc trong trang "Đơn hàng của tôi"
         */
        @GetMapping("/my-deposits")
        public ResponseEntity<List<Map<String, Object>>> getMyDeposits(
                        jakarta.servlet.http.HttpServletRequest request) {

                String email = request.getHeader("X-User-Email");
                log.info("[CustomerPaymentController] GET /my-deposits - Email: {}", email);

                if (email == null || email.isEmpty()) {
                        return ResponseEntity.ok(List.of());
                }

                try {
                        List<com.ev.payment_service.entity.PaymentRecord> records =
                                paymentRecordRepository.findByCustomerEmail(email);

                        // Map to response with metadata (only deposits that have metadata)
                        List<Map<String, Object>> deposits = records.stream()
                                .filter(r -> r.getMetadata() != null && !r.getMetadata().isEmpty())
                                .map(r -> {
                                        Map<String, Object> deposit = new java.util.LinkedHashMap<>();
                                        deposit.put("recordId", r.getRecordId());
                                        deposit.put("orderId", r.getOrderId());
                                        deposit.put("customerId", r.getCustomerId());
                                        deposit.put("customerName", r.getCustomerName());
                                        deposit.put("customerPhone", r.getCustomerPhone());
                                        deposit.put("customerEmail", r.getCustomerEmail());
                                        deposit.put("totalAmount", r.getTotalAmount());
                                        deposit.put("amountPaid", r.getAmountPaid());
                                        deposit.put("remainingAmount", r.getRemainingAmount());
                                        deposit.put("status", r.getStatus());
                                        deposit.put("createdAt", r.getCreatedAt());
                                        deposit.put("updatedAt", r.getUpdatedAt());

                                        // Parse metadata JSON
                                        try {
                                                com.fasterxml.jackson.databind.ObjectMapper mapper =
                                                        new com.fasterxml.jackson.databind.ObjectMapper();
                                                Map<String, Object> metadata = mapper.readValue(r.getMetadata(),
                                                        new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
                                                deposit.put("metadata", metadata);
                                        } catch (Exception e) {
                                                log.warn("Failed to parse metadata for record {}: {}", r.getRecordId(), e.getMessage());
                                                deposit.put("metadata", null);
                                        }

                                        return deposit;
                                })
                                .collect(java.util.stream.Collectors.toList());

                        log.info("[CustomerPaymentController] Found {} deposits for email: {}", deposits.size(), email);
                        return ResponseEntity.ok(deposits);
                } catch (Exception e) {
                        log.error("[CustomerPaymentController] Error fetching deposits for email {}: {}", email, e.getMessage());
                        return ResponseEntity.ok(List.of());
                }
        }
}
