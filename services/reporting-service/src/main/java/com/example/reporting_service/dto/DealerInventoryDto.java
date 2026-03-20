package com.example.reporting_service.dto;

import lombok.Data;

@Data
public class DealerInventoryDto {
    private Long variantId;
    private String modelName;
    private String versionName;
    private String color;
    private Integer availableQuantity;
    private Integer allocatedQuantity;
    private java.util.UUID dealerId;
}
