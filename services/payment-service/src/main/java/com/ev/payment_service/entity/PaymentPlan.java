package com.ev.payment_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "payment_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "plan_id", columnDefinition = "BINARY(16)")
    private UUID planId;

    @Column(name = "plan_name", length = 255, nullable = false)
    private String planName; // Ví dụ: "Trả góp 6 tháng"

    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount; // Tổng tiền (có thể không cần nếu tính từ order)

    @Column(name = "down_payment", precision = 12, scale = 2)
    private BigDecimal downPayment; // Số tiền trả trước

    @Column(name = "number_of_installments")
    private Integer numberOfInstallments; // Số kỳ trả góp

    @Column(name = "interest_rate", precision = 5, scale = 2)
    private BigDecimal interestRate; // Lãi suất (%)

    @Column(name = "monthly_payment", precision = 12, scale = 2)
    private BigDecimal monthlyPayment; // Số tiền trả hàng tháng

    @Column(name = "plan_type", length = 50)
    private String planType; // Ví dụ: "TRA_GOP", "TRA_THANG"
}