package com.ev.inventory_service.dto.event;

import lombok.Data;

@Data
public class OrderConfirmedEvent {
    private String orderId;
    private Long variantId;
    private Long dealerId;
    private Integer quantity;
}
