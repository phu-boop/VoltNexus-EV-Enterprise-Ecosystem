package com.example.reporting_service.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "central_inventory_transaction_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CentralInventoryTransactionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long variantId;

    private String variantName;

    private Long modelId;

    private String modelName;

    @Column(nullable = false)
    private String transactionType; // RESTOCK, ALLOCATE, TRANSFER_TO_DEALER, etc.

    @Column(nullable = false)
    private Integer quantity;

    private String toDealerId; // UUID string - null nếu không liên quan đến đại lý

    private String fromDealerId; // UUID string - null nếu từ kho trung tâm

    private String staffId; // Email nhân viên thực hiện

    private String referenceId; // ID đơn hàng, phiếu nhập/xuất

    private String notes;

    @Column(nullable = false)
    private LocalDateTime transactionDate;

    @Column(name = "received_at")
    private LocalDateTime receivedAt; // Thời điểm reporting-service nhận event
}
