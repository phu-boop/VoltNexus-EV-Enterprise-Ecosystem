package com.ev.common_lib.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class B2COrderPlacedEvent {
    private UUID orderId;
    private UUID dealerId;
    private BigDecimal totalAmount;
    private LocalDateTime orderDate;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private String modelName;
    private String variantName;
}
