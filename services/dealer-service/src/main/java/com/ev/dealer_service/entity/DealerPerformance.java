package com.ev.dealer_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "dealer_performance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DealerPerformance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "performance_id")
    private Long performanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dealer_id", nullable = false)
    private Dealer dealer;

    @Column(name = "period", length = 20)
    private String period; // e.g., "2025-Q1", "2025-01"

    @Column(name = "total_sales", precision = 15, scale = 2)
    private BigDecimal totalSales;

    @Column(name = "customer_satisfaction", precision = 3, scale = 2)
    private BigDecimal customerSatisfaction; // Rating 0-5

    @Column(name = "delivery_time_avg", precision = 5, scale = 2)
    private BigDecimal deliveryTimeAvg; // Average days

    @Column(name = "ranking")
    private Integer ranking;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
