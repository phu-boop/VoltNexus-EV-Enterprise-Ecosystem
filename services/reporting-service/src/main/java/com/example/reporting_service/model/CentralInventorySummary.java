package com.example.reporting_service.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.sql.Timestamp;

@Entity
@Table(name = "central_inventory_summary",
       uniqueConstraints = @UniqueConstraint(
           name = "idx_central_inv_variant",
           columnNames = {"variantId"}
       )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CentralInventorySummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long variantId;

    private String variantName;

    private Long modelId;

    private String modelName;

    // Tổng số xe đã nhập kho (RESTOCK + INITIAL_STOCK)
    @Column(nullable = false)
    private Long totalImported = 0L;

    // Tổng số xe đã phân bổ (ALLOCATE)
    @Column(nullable = false)
    private Long totalAllocated = 0L;

    // Tổng số xe đã điều phối sang đại lý (TRANSFER_TO_DEALER)
    @Column(nullable = false)
    private Long totalTransferred = 0L;

    // Tồn kho hiện tại = totalImported - totalTransferred
    @Column(nullable = false)
    private Long availableStock = 0L;

    @Column(name = "last_updated_at")
    private Timestamp lastUpdatedAt;
}
