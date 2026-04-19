package com.ev.common_lib.event;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.sql.Timestamp;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DealerStockUpdatedEvent {
    private Long variantId;
    private String variantName;
    private Long modelId;
    private String modelName;
    
    // --- Thông tin định danh KHO ---
    private UUID dealerId; 
    
    // --- Thông tin SỐ LƯỢNG MỚI (Trạng thái mới) ---
    private int newAvailableQuantity; // Tồn kho khả dụng MỚI
    private int newAllocatedQuantity; // Tồn kho đã giữ MỚI
    
    // --- Thông tin thời gian ---
    private Timestamp lastUpdatedAt;
}
