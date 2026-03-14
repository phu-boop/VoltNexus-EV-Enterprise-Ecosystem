package com.ev.sales_service.dto.outbound;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder // Thêm
public class PromotionDTO {
    private UUID id;
    private String promotionName;
    private String description; // Thêm
    private BigDecimal discountRate; // Thêm
}
