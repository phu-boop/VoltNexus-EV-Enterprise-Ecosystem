package com.ev.payment_service.repository;

import com.ev.payment_service.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    // Lấy transaction mới nhất của một payment record
    Optional<Transaction> findFirstByPaymentRecordOrderByTransactionDateDesc(com.ev.payment_service.entity.PaymentRecord paymentRecord);

    // Lấy tất cả giao dịch của một sổ thanh toán (PaymentRecord)
    List<Transaction> findByPaymentRecord_RecordId(UUID recordId);

    // Lấy tất cả giao dịch của một đơn hàng (Order)
    // (Query lồng qua PaymentRecord)
    List<Transaction> findByPaymentRecord_OrderId(UUID orderId);

    // Lấy danh sách giao dịch chờ duyệt (PENDING) cho tất cả payment methods
    // Cho B2C orders (có customerId trong PaymentRecord)
    @Query("SELECT t FROM Transaction t " +
           "WHERE t.status = 'PENDING' " +
           "AND t.paymentRecord.customerId IS NOT NULL " +
           "ORDER BY t.transactionDate DESC")
    Page<Transaction> findPendingManualTransactions(Pageable pageable);
}