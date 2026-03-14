package com.ev.sales_service.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class OrderItemRequest {

    @NotNull(message = "ORDER ID IS REQUIRED")
    private UUID orderId;

    @NotNull(message = "VARIANT ID IS REQUIRED")
    private Long variantId;

    @NotNull(message = "QUANTITY IS REQUIRED")
    @Positive(message = "QUANTITY MUST BE GREATER THAN 0")
    private Integer quantity;

    @NotNull(message = "UNIT PRICE IS REQUIRED")
    @Positive(message = "UNIT PRICE MUST BE GREATER THAN 0")
    private BigDecimal unitPrice;

    private BigDecimal discount; // Optional: discount percentage

    private String itemNotes; // Optional: additional notes for this item

    private String color; // Optional: selected color

    private String specifications; // Optional: item specifications or customizations
}
