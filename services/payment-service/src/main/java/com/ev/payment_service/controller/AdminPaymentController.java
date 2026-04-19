package com.ev.payment_service.controller;

import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.payment_service.dto.response.BookingDepositResponse;
import com.ev.payment_service.entity.PaymentRecord;
import com.ev.payment_service.entity.Transaction;
import com.ev.payment_service.repository.PaymentRecordRepository;
import com.ev.payment_service.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminPaymentController {

    private final PaymentRecordRepository paymentRecordRepository;
    private final TransactionRepository transactionRepository;
    private final RestTemplate restTemplate;

    @Value("${customer-service.url}")
    private String customerServiceBaseUrl;

    /**
     * Lấy danh sách booking deposits
     */
    @GetMapping("/booking-deposits")
    public ResponseEntity<ApiRespond<List<BookingDepositResponse>>> getBookingDeposits(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        try {
            log.info("Getting booking deposits - Status: {}", status);

            List<PaymentRecord> records;

            if (status != null && !status.equals("ALL")) {
                records = paymentRecordRepository.findByStatus(status, Sort.by(Sort.Direction.DESC, "createdAt"));
            } else {
                // Lấy tất cả các record có status liên quan đến booking
                records = paymentRecordRepository.findByStatusIn(
                        List.of("PENDING_DEPOSIT", "PROCESSING", "COMPLETED", "PAID", "PARTIALLY_PAID"),
                        Sort.by(Sort.Direction.DESC, "createdAt"));
            }

            List<BookingDepositResponse> responses = new ArrayList<>();

            for (PaymentRecord record : records) {
                responses.add(mapToBookingDepositResponse(record));
            }

            return ResponseEntity.ok(ApiRespond.success("Success", responses));

        } catch (Exception e) {
            log.error("Error getting booking deposits", e);
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }

    /**
     * Lấy chi tiết payment record
     */
    @GetMapping("/payment-records/{recordId}")
    public ResponseEntity<ApiRespond<BookingDepositResponse>> getPaymentRecord(@PathVariable UUID recordId) {
        try {
            PaymentRecord record = paymentRecordRepository.findById(recordId)
                    .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

            return ResponseEntity.ok(ApiRespond.success("Success", mapToBookingDepositResponse(record)));
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error getting payment record: {}", recordId, e);
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }

    /**
     * Cập nhật payment record
     */
    @PutMapping("/payment-records/{recordId}")
    public ResponseEntity<ApiRespond<PaymentRecord>> updatePaymentRecord(
            @PathVariable UUID recordId,
            @RequestBody Map<String, Object> updates) {
        try {
            PaymentRecord record = paymentRecordRepository.findById(recordId)
                    .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

            if (updates.containsKey("orderId")) {
                record.setOrderId(UUID.fromString((String) updates.get("orderId")));
            }
            if (updates.containsKey("status")) {
                record.setStatus((String) updates.get("status"));
            }

            PaymentRecord savedRecord = paymentRecordRepository.save(record);

            return ResponseEntity.ok(ApiRespond.success("Payment record updated successfully", savedRecord));

        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error updating payment record", e);
            throw new AppException(ErrorCode.INTERNAL_ERROR);
        }
    }

    private BookingDepositResponse mapToBookingDepositResponse(PaymentRecord record) {
        // Lấy thông tin transaction
        Transaction transaction = transactionRepository
                .findFirstByPaymentRecordOrderByTransactionDateDesc(record)
                .orElse(null);

        // Lấy thông tin customer
        String customerName = "N/A";
        String customerEmail = "N/A";
        String customerPhone = "N/A";

        // Kiểm tra xem có thông tin customer trong PaymentRecord không (cho guest
        // booking)
        if (record.getCustomerName() != null && !record.getCustomerName().isEmpty()) {
            customerName = record.getCustomerName();
            customerEmail = record.getCustomerEmail() != null ? record.getCustomerEmail() : "N/A";
            customerPhone = record.getCustomerPhone() != null ? record.getCustomerPhone() : "N/A";
        } else if (record.getCustomerId() != null) {
            // Nếu có customerId, lấy từ customer-service
            try {
                String customerServiceUrl = customerServiceBaseUrl + "/api/v1/customers/" + record.getCustomerId();
                ResponseEntity<Map> customerResponse = restTemplate.getForEntity(customerServiceUrl, Map.class);
                if (customerResponse.getStatusCode().is2xxSuccessful() && customerResponse.getBody() != null) {
                    Map<String, Object> responseBody = customerResponse.getBody();
                    Map<String, Object> data = (Map<String, Object>) responseBody.get("data");
                    if (data != null) {
                        String firstName = (String) data.getOrDefault("firstName", "");
                        String lastName = (String) data.getOrDefault("lastName", "");
                        customerName = (firstName + " " + lastName).trim();
                        if (customerName.isEmpty()) {
                            customerName = "N/A";
                        }
                        customerEmail = (String) data.getOrDefault("email", "N/A");
                        customerPhone = (String) data.getOrDefault("phone", "N/A");
                    }
                }
            } catch (Exception e) {
                log.warn("Could not fetch customer info for customerId: {}, Error: {}", record.getCustomerId(),
                        e.getMessage());
            }
        }

        return BookingDepositResponse.builder()
                .recordId(record.getRecordId())
                .orderId(record.getOrderId())
                .customerId(record.getCustomerId())
                .customerName(customerName)
                .customerEmail(customerEmail)
                .customerPhone(customerPhone)
                .totalAmount(record.getTotalAmount())
                .amountPaid(transaction != null ? transaction.getAmount() : BigDecimal.ZERO)
                .remainingAmount(record.getRemainingAmount())
                .status(record.getStatus())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .transactionId(transaction != null ? transaction.getTransactionId() : null)
                .gatewayTransactionId(transaction != null ? transaction.getGatewayTransactionId() : null)
                .paymentMethodName(transaction != null && transaction.getPaymentMethod() != null
                        ? transaction.getPaymentMethod().getMethodName()
                        : "N/A")
                .orderInfo(transaction != null ? transaction.getNotes() : null)
                .metadata(record.getMetadata())
                .build();
    }
}
