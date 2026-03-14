package com.ev.payment_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "installment_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstallmentSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "schedule_id", columnDefinition = "BINARY(16)")
    private UUID scheduleId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "record_id", nullable = false)
    private PaymentRecord paymentRecord; // Thuộc sổ thanh toán nào

    @Column(name = "installment_number", nullable = false)
    private Integer installmentNumber; // Kỳ thanh toán số (1, 2, 3...)

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate; // Ngày đến hạn

    @Column(name = "amount_due", precision = 12, scale = 2, nullable = false)
    private BigDecimal amountDue; // Số tiền phải trả

    @Column(name = "status", length = 50, nullable = false)
    private String status; // PENDING, PAID, OVERDUE

    @Column(name = "paid_date")
    private LocalDate paidDate; // Ngày thực trả
}