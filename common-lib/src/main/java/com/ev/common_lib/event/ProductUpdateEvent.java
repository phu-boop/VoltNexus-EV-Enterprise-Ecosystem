package com.ev.common_lib.event;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductUpdateEvent {
    private Long variantId;
    private String modelName;
    private String versionName;
    private String color;
    private BigDecimal newPrice;
    private String status;
    private String imageUrl;
}
