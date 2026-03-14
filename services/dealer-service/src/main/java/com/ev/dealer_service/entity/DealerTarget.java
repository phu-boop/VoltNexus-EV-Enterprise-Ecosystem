package com.ev.dealer_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "dealer_targets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DealerTarget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "target_id")
    private Long targetId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dealer_id", nullable = false)
    private Dealer dealer;

    @Column(name = "target_period", length = 20)
    private String targetPeriod; // e.g., "2025-Q1", "2025-01"

    @Column(name = "sales_target", precision = 15, scale = 2)
    private BigDecimal salesTarget;

    @Column(name = "actual_sales", precision = 15, scale = 2)
    private BigDecimal actualSales;

    @Column(name = "achievement_rate", precision = 5, scale = 2)
    private BigDecimal achievementRate;

    @Column(name = "set_date")
    private LocalDate setDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
