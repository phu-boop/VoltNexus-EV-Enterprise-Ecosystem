package com.ev.inventory_service.model;

import com.ev.inventory_service.model.Enum.TransferRequestStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity này đại diện cho một "Yêu cầu điều chuyển" (Phiếu công việc).
 * Nó theo dõi trạng thái của một yêu cầu điều chuyển từ kho trung tâm đến đại lý,
 * từ lúc được tạo (PENDING) cho đến khi hoàn tất (DELIVERED).
 */
@Entity
@Table(name = "transfer_requests")
@Data
public class TransferRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @Column(nullable = false)
    private Long variantId; // Loại xe (SKU) được yêu cầu

    @Column(nullable = false)
    private Integer quantity; // Số lượng xe được yêu cầu

    @Column(nullable = false)
    private UUID toDealerId; // Đại lý sẽ nhận hàng

    @Column(nullable = false)
    private String requesterEmail; // Email của EVM Staff (hoặc người) tạo yêu cầu

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransferRequestStatus status; // Trạng thái của yêu cầu (PENDING, CONFIRMED, ...)

    private String notes; // Ghi chú cho yêu cầu

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt; // Thời điểm yêu cầu được tạo
}
