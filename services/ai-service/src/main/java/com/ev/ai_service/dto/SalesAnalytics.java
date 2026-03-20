package com.ev.ai_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO cho phân tích doanh số
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesAnalytics {
    
    private Integer totalSales; // Tổng số lượng bán
    private BigDecimal totalRevenue; // Tổng doanh thu
    private Integer totalOrders; // Tổng số đơn hàng
    private Double averageOrderValue; // Giá trị đơn hàng trung bình
    private Integer monthOverMonthGrowth; // Tăng trưởng theo tháng (%)
    private String topSellingVariant; // Variant bán chạy nhất
}
