// Đây là sự kiện được bắn ra khi đơn hàng bị hủy (bởi đại lý hoặc staff)
package com.ev.common_lib.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCancelledEvent {
    private UUID orderId;
    private String cancelledByEmail;
    private LocalDateTime cancellationDate;
}
