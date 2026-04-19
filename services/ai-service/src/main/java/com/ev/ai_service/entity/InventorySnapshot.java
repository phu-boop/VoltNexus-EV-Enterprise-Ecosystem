package com.ev.ai_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity để lưu trữ snapshot tồn kho theo thời gian
 * Dùng để phân tích tốc độ tiêu thụ
 */
@Entity
@Table(name = "inventory_snapshot", indexes = {
    @Index(name = "idx_variant_snapshot", columnList = "variantId,snapshotDate"),
    @Index(name = "idx_dealer_snapshot", columnList = "dealerId,snapshotDate")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventorySnapshot {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long variantId;
    
    @Column(nullable = false)
    private UUID dealerId;
    
    @Column(length = 100)
    private String region;
    
    @Column(nullable = false)
    private Integer availableQuantity;
    
    @Column(nullable = false)
    private Integer reservedQuantity;
    
    @Column(nullable = false)
    private Integer totalQuantity;
    
    @Column(nullable = false)
    private LocalDateTime snapshotDate;
    
    @Column(nullable = false)
    private LocalDateTime recordedAt;
    
    // Metadata
    @Column(length = 100)
    private String modelName;
    
    @Column(length = 100)
    private String variantName;
}
