package com.ev.inventory_service.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "central_inventory")
@Data
public class CentralInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inventoryId;

    @Column(nullable = false, unique = true)
    private Long variantId; // Khóa ngoại trỏ đến vehicle-catalog-service

    @Column(nullable = false)
    private Integer totalQuantity; // Tổng số lượng đã từng nhập

    @Column(nullable = false)
    private Integer allocatedQuantity; // Số lượng đã phân bổ cho các đại lý

    @Column(nullable = false)
    private Integer availableQuantity; // Số lượng thực tế còn lại trong kho trung tâm

    private Integer reorderLevel; // Ngưỡng cảnh báo đặt hàng lại

    private LocalDateTime lastRestockDate;
}
