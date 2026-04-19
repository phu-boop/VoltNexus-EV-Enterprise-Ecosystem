package com.ev.inventory_service.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_alerts")
@Data
public class StockAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long alertId;

    @Column(nullable = false)
    private Long variantId;

    private UUID dealerId;

    @Column(nullable = false)
    private String alertType; // Ví dụ: "LOW_STOCK_CENTRAL", "LOW_STOCK_DEALER"

    private Integer currentStock; // Số lượng tồn kho tại thời điểm tạo cảnh báo

    private Integer threshold; // Ngưỡng đã được thiết lập

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime alertDate;

    @Column(nullable = false)
    private String status; // Ví dụ: "NEW", "ACKNOWLEDGED", "RESOLVED"
}
