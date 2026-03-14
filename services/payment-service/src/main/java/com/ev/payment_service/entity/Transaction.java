package com.ev.payment_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "transaction_id", columnDefinition = "BINARY(16)")
    private UUID transactionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "record_id", nullable = false)
    private PaymentRecord paymentRecord; // Giao dịch này thuộc sổ thanh toán nào

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "method_id") // PTTT được sử dụng
    private PaymentMethod paymentMethod;

    @Column(name = "amount", precision = 12, scale = 2, nullable = false)
    private BigDecimal amount; // Số tiền của giao dịch này

    @Column(name = "transaction_date", nullable = false)
    @Builder.Default
    private LocalDateTime transactionDate = LocalDateTime.now();

    @Column(name = "status", length = 50, nullable = false)
    private String status; // PENDING, SUCCESS, FAILED

    @Column(name = "gateway_transaction_id", length = 255) // Mã của VNPAY/Paypal...
    private String gatewayTransactionId;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes; // Ghi chú, ví dụ: "Thanh toan dot 1"
}