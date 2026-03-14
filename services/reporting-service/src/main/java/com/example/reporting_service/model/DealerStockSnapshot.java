package com.example.reporting_service.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "dealer_stock_snapshot")
@Data
@NoArgsConstructor
@IdClass(DealerStockSnapshotId.class) // Báo cho JPA biết dùng lớp ở trên làm Khóa
public class DealerStockSnapshot implements Serializable {

    @Id
    private UUID dealerId; // Khớp với kiểu Long trong service của bạn

    @Id
    private Long variantId;

    private Long currentStock;
    
    /**
     * Đây là constructor mà InventoryPersistenceService đang gọi
     *
     */
    public DealerStockSnapshot(UUID dealerId, Long variantId, Long currentStock) {
        this.dealerId = dealerId;
        this.variantId = variantId;
        this.currentStock = currentStock;
    }
}
