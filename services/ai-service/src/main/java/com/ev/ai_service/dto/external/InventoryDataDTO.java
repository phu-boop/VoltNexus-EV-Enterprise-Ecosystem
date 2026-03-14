package com.ev.ai_service.dto.external;

import lombok.Data;

@Data
public class InventoryDataDTO {
    private String variantId;
    private int currentStock;
    private String warehouseName;
}
