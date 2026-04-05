package com.ev.vehicle_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceHistoryDto {
    private Long priceId;
    private BigDecimal oldPrice;
    private BigDecimal newPrice;
    private LocalDateTime changeDate;
    private String reason;
    private String changedBy;
}
