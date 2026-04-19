package com.ev.inventory_service.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "dealer_inventory")
@Data
public class DealerAllocation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long allocationId;

    @Column(nullable = false)
    private UUID dealerId; // Khóa ngoại trỏ đến dealer-service

    @Column(nullable = false)
    private Long variantId; // Khóa ngoại trỏ đến vehicle-catalog-service

    @Column(nullable = false)
    private Integer allocatedQuantity; // Số lượng được phân bổ

    @Column(nullable = false)
    private Integer availableQuantity; // Số lượng thực tế còn lại có thể bán

    private Integer reorderLevel; // Ngưỡng cảnh báo riêng của đại lý

    private String status; // Trạng thái xe tại kho đại lý (mới, cũ, đã qua sữa chữa,...)

    @org.hibernate.annotations.UpdateTimestamp
    private LocalDateTime lastUpdated;
}
