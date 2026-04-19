// Đây là sự kiện được bắn ra khi đại lý đặt hàng thành công (sau khi createB2BOrder)
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
public class B2BOrderPlacedEvent {
    private UUID orderId;
    private UUID dealerId;
    private BigDecimal totalAmount;
    private LocalDateTime orderDate;
    private String placedByEmail;
}
