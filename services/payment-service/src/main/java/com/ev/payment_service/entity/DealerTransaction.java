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
@Table(name = "dealer_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DealerTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "dealer_transaction_id", columnDefinition = "BINARY(16)")
    private UUID dealerTransactionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "dealer_invoice_id", nullable = false)
    private DealerInvoice dealerInvoice; // Giao dịch này trả cho hóa đơn nào

    @Column(name = "amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal amount; // Số tiền giao dịch

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate; // Ngày đại lý chuyển tiền

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "method_id") // PTTT được sử dụng (ví dụ: Chuyển khoản B2B)
    private PaymentMethod paymentMethod;

    @Column(name = "transaction_code", length = 255)
    private String transactionCode; // Mã giao dịch ngân hàng (để đối soát)

    @Column(name = "status", length = 50, nullable = false)
    private String status; // PENDING_CONFIRMATION, SUCCESS, FAILED

    @Column(name = "confirmed_by_staff_id", columnDefinition = "BINARY(16)")
    private UUID confirmedByStaffId; // << ID của EVM_STAFF (kế toán)

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes; // Ghi chú của Đại lý hoặc Kế toán
}