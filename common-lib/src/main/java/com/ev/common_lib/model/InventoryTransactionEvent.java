package com.ev.common_lib.model;

import com.ev.common_lib.model.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Lớp DTO này đại diện cho một "sự kiện" giao dịch kho.
 * Nó được gửi từ inventory-service lên Kafka và được các service khác (như ai-service, reporting-service) lắng nghe.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransactionEvent {
    
    // Các trường dữ liệu được sao chép từ Entity InventoryTransaction
    // để các service khác có thể sử dụng mà không cần phụ thuộc vào entity.

    private Long transactionId;
    private Long variantId;
    private TransactionType transactionType;
    private Integer quantity;
    private Long fromDealerId;
    private Long toDealerId;
    private LocalDateTime transactionDate;
    private String staffId;
    private String referenceId;
    private String notes;
}