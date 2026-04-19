// Đây là sự kiện được bắn ra khi đại lý xác nhận đã nhận hàng.
package com.ev.common_lib.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDeliveredEvent {
    private UUID orderId;
    private UUID dealerId;
    private LocalDateTime deliveryDate;
    private BigDecimal totalAmount; // Tổng tiền cả đơn
    
    private List<OrderItemDetail> items; 
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemDetail {
        private Long variantId;
        private int quantity;
        private BigDecimal finalPrice; // Giá cuối của line item này
    }
}
