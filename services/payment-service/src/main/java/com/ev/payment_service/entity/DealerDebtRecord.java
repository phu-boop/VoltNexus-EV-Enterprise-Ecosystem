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
@Table(name = "dealer_debt_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DealerDebtRecord {

    @Id
    @Column(name = "dealer_id", columnDefinition = "BINARY(16)")
    private UUID dealerId; // << Khớp với dealers.dealer_id, đây là PK

    @Column(name = "total_owed", precision = 20, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal totalOwed = BigDecimal.ZERO; // Tổng nợ (từ tất cả hóa đơn)

    @Column(name = "total_paid", precision = 20, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal totalPaid = BigDecimal.ZERO; // Tổng đã trả (từ tất cả giao dịch)

    // (total_owed - total_paid)
    @Column(name = "current_balance", precision = 20, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal currentBalance = BigDecimal.ZERO; // Dư nợ hiện tại

    @Column(name = "last_updated", nullable = false)
    @Builder.Default
    private LocalDateTime lastUpdated = LocalDateTime.now();

    // Tự động tính toán lại dư nợ
    @PrePersist
    @PreUpdate
    public void calculateBalance() {
        if (this.totalOwed == null) this.totalOwed = BigDecimal.ZERO;
        if (this.totalPaid == null) this.totalPaid = BigDecimal.ZERO;
        this.currentBalance = this.totalOwed.subtract(this.totalPaid);
        this.lastUpdated = LocalDateTime.now();
    }
}