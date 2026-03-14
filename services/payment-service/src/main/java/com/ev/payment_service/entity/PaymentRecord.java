package com.ev.payment_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "record_id", columnDefinition = "BINARY(16)")
    private UUID recordId;

    // --- Khóa ngoại từ các Service khác ---
    @Column(name = "order_id", columnDefinition = "BINARY(16)", nullable = false, unique = true)
    private UUID orderId; // << Khớp với sales_orders.order_id

    @Column(name = "customer_id", nullable = true)
    private Long customerId; // << Khớp với customers.customer_id (bigint)

    // --- Thông tin khách hàng cho guest booking (khi customerId = null) ---
    @Column(name = "customer_name", length = 255)
    private String customerName;

    @Column(name = "customer_phone", length = 20)
    private String customerPhone;

    @Column(name = "customer_email", length = 255)
    private String customerEmail;

    @Column(name = "customer_id_card", length = 20)
    private String customerIdCard;

    // --- Metadata cho booking deposit ---
    @Lob
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata; // JSON string chứa thông tin booking (variantId, modelId, colors, showroom,
                             // etc.)

    // --- Khóa ngoại nội bộ ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id") // Có thể null nếu là trả thẳng
    private PaymentPlan paymentPlan;

    // --- Thông tin tài chính ---
    @Column(name = "total_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalAmount; // Tổng giá trị đơn hàng (lấy từ order)

    @Column(name = "amount_paid", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal amountPaid = BigDecimal.ZERO; // Số tiền đã thanh toán

    @Column(name = "remaining_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal remainingAmount; // totalAmount - amountPaid

    @Column(name = "status", length = 50, nullable = false)
    private String status; // Ví dụ: "PENDING", "PARTIALLY_PAID", "PAID", "OVERDUE"

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Tự động cập nhật remainingAmount trước khi lưu
    @PrePersist
    @PreUpdate
    public void calculateRemaining() {
        if (this.totalAmount == null) {
            this.totalAmount = BigDecimal.ZERO;
        }
        if (this.amountPaid == null) {
            this.amountPaid = BigDecimal.ZERO;
        }
        this.remainingAmount = this.totalAmount.subtract(this.amountPaid);
        this.updatedAt = LocalDateTime.now();
    }
}