package com.ev.common_lib.dto.inventory;

import com.ev.common_lib.model.enums.InventoryLevelStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventoryComparisonDto {
    private Long variantId;
    private int centralStockAvailable; // Tồn kho trung tâm
    private int dealerStockAvailable;  // Tồn kho của chính đại lý này
    private InventoryLevelStatus status; // Trạng thái chung (IN_STOCK, LOW_STOCK...)
}
