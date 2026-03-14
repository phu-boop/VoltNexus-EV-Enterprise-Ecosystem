package com.ev.inventory_service.dto.response;

import com.ev.common_lib.model.enums.*;
import lombok.Builder;
import lombok.Data;
import java.util.List;

import com.ev.common_lib.model.enums.InventoryLevelStatus;

@Data
@Builder
public class InventoryStatusDto {
    // Thông tin định danh sản phẩm
    private Long variantId;
    private String variantName; // (Lấy từ vehicle-service)
    private String skuCode;     // (Lấy từ vehicle-service)

    // Thông tin chỉ liên quan đến kho TRUNG TÂM
    private Integer totalQuantity;           // Tổng số lượng đã nhập vào kho trung tâm
    private Integer allocatedQuantity;       // Số lượng đã phân bổ cho các đại lý
    private Integer availableQuantity;       // Số lượng thực tế còn lại trong kho trung tâm
    private Integer reorderLevel;            // Ngưỡng đặt lại của kho trung tâm

    // Trạng thái tính toán của kho TRUNG TÂM
    private InventoryLevelStatus status;
}
