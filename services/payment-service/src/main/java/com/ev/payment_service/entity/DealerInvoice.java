package com.ev.payment_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "dealer_invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DealerInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "dealer_invoice_id", columnDefinition = "BINARY(16)")
    private UUID dealerInvoiceId;

    // --- Khóa ngoại từ các Service khác ---
    @Column(name = "dealer_id", columnDefinition = "BINARY(16)", nullable = false)
    private UUID dealerId; // << Khớp với dealers.dealer_id

    @Column(name = "created_by_staff_id", columnDefinition = "BINARY(16)", nullable = false)
    private UUID createdByStaffId; // << ID của EVM_STAFF (từ user.id)

    // --- Thông tin hóa đơn ---
    @Column(name = "total_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalAmount; // Tổng tiền hóa đơn

    @Column(name = "amount_paid", precision = 15, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal amountPaid = BigDecimal.ZERO; // Đã trả

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate; // Hạn chót thanh toán

    @Column(name = "status", length = 50, nullable = false)
    private String status; // UNPAID, PARTIALLY_PAID, PAID, OVERDUE

    // --- Thông tin tham chiếu (linking) ---
    @Column(name = "reference_type", length = 100)
    private String referenceType; // e.g., "VEHICLE_SHIPMENT", "SALES_ORDER_B2B"

    @Column(name = "reference_id", length = 100)
    private String referenceId; // e.g., ID của lô hàng, ID của đơn hàng B2B

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}