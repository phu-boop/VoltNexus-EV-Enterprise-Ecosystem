package com.ev.sales_service.entity;

import com.ev.sales_service.enums.NotificationAudience;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @Column(nullable = false, length = 50)
    private String type; // Ví dụ: "ORDER_DISPUTED", "ORDER_PLACED"

    @Column(nullable = false, length = 512)
    private String message; // Nội dung thông báo

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean isRead = false;

    // Lưu đường dẫn để khi click vào thông báo có thể điều hướng
    @Column(length = 255)
    private String link;

    // Phân biệt thông báo này dành cho ai (STAFF hay DEALER)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NotificationAudience audience;

    @Column(name = "dealer_id")
    private UUID dealerId;

    @Column(name = "customer_id")
    private Long customerId;
}
