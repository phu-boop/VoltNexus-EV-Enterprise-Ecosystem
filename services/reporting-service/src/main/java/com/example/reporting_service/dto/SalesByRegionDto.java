package com.example.reporting_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesByRegionDto {
    private String region;
    private BigDecimal totalSales = BigDecimal.ZERO;
    private long totalOrders = 0;
    private List<DealerSalesReportDto> dealers = new ArrayList<>();
}
