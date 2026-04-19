package com.ev.common_lib.event;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO (Event) được gửi qua Kafka khi có cảnh báo tồn kho.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAlertEvent {
    
    private Long alertId;
    private Long variantId;
    private String alertType; // "LOW_STOCK_CENTRAL"
    private Integer currentStock;
    private Integer threshold;
    private LocalDateTime alertDate;

    private String variantName; 
    private String skuCode;
}
