package com.ev.ai_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity để lưu trữ lịch sử bán hàng từ Sales Service
 * Dùng cho việc phân tích và dự báo nhu cầu
 */
@Entity
@Table(name = "sales_history", indexes = {
    @Index(name = "idx_variant_date", columnList = "variantId,saleDate"),
    @Index(name = "idx_dealer_date", columnList = "dealerId,saleDate"),
    @Index(name = "idx_region_date", columnList = "region,saleDate")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private UUID orderId;
    
    @Column(nullable = false)
    private Long variantId;
    
    @Column(nullable = false)
    private UUID dealerId;
    
    @Column(length = 100)
    private String region; // Khu vực (Miền Bắc, Miền Nam, Miền Trung)
    
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal totalAmount;
    
    @Column(nullable = false)
    private LocalDateTime saleDate;
    
    @Column(nullable = false)
    private LocalDateTime recordedAt;
    
    @Column(length = 50)
    private String orderStatus; // COMPLETED, CANCELLED, etc.
    
    // Metadata for analysis
    @Column(length = 100)
    private String modelName;
    
    @Column(length = 100)
    private String variantName;
}
