package com.ev.sales_service.dto.request;

import com.ev.sales_service.enums.OrderStatusB2C;
import com.ev.sales_service.enums.OrderTrackingStatus;
import lombok.Data;

import java.util.UUID;

@Data
public class OrderTrackingRequest {
    private UUID orderId;
    private OrderTrackingStatus status;
    private String notes;
    private UUID updatedBy;
    private OrderTrackingStatus statusB2C;
}