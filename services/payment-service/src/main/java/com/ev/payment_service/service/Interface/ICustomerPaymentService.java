package com.ev.payment_service.service.Interface;

import com.ev.payment_service.dto.request.InitiatePaymentRequest;
import com.ev.payment_service.dto.response.InitiatePaymentResponse;
import com.ev.payment_service.dto.response.PaymentRecordResponse;
import com.ev.payment_service.dto.response.PaymentStatisticsResponse;
import com.ev.payment_service.dto.response.TransactionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ICustomerPaymentService {

        InitiatePaymentResponse initiatePayment(UUID orderId, InitiatePaymentRequest request, String userEmail,
                        UUID userProfileId);

        TransactionResponse confirmManualPayment(UUID transactionId, String userEmail, UUID userProfileId, String notes,
                        String action);

        List<TransactionResponse> getPaymentHistory(UUID orderId);

        /**
         * Lấy tổng công nợ của một khách hàng
         * 
         * @param customerId ID của khách hàng
         * @return Tổng công nợ (remainingAmount từ tất cả PaymentRecord của khách hàng)
         */
        BigDecimal getCustomerTotalDebt(Long customerId);

        /**
         * Lấy danh sách thanh toán tiền mặt chờ duyệt (B2C orders) - Dealer Manager
         */
        Page<TransactionResponse> getPendingCashPaymentsB2C(Pageable pageable);

        /**
         * Lấy danh sách payment records với filter (Admin)
         */
        Page<PaymentRecordResponse> filterPaymentRecords(
                        String status,
                        LocalDateTime startDate,
                        LocalDateTime endDate,
                        UUID orderId,
                        Long customerId,
                        Pageable pageable);

        /**
         * Lấy thống kê payment (Admin)
         */
        PaymentStatisticsResponse getPaymentStatistics(LocalDateTime startDate, LocalDateTime endDate);

        /**
         * Lấy danh sách PaymentRecord theo customerId (cho customer xem deposits)
         */
        List<com.ev.payment_service.entity.PaymentRecord> getPaymentRecordsByCustomerId(Long customerId);
}
