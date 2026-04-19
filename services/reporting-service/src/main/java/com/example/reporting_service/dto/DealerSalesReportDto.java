package com.example.reporting_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.UUID;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DealerSalesReportDto {
    private UUID dealerId;
    private String dealerName;
    private String dealerCode;
    private BigDecimal totalSales = BigDecimal.ZERO;
    private long totalOrders = 0;
}
