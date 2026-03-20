package com.ev.sales_service.dto.response;

import com.ev.sales_service.enums.OrderTrackingStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class OrderTrackingResponse {
    private UUID trackId;
    private OrderTrackingStatus status;
    private LocalDateTime updateDate;
    private String notes;
    private UUID updatedBy;
}