package com.ev.common_lib.event;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PromotionCreatedEvent {
    private String eventId; // UUID string, use same as outbox.id for idempotency
    private UUID promotionId;
    private String promotionName;
    private String description;
    private BigDecimal discountRate;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime occurredAt;
}
