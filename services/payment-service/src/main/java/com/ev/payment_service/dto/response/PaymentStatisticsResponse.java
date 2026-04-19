package com.ev.payment_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Response DTO cho thống kê thanh toán
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatisticsResponse {

    // Tổng quan doanh thu
    private BigDecimal totalRevenue;
    private BigDecimal pendingAmount;
    private BigDecimal completedAmount;

    // Số lượng orders
    private Long totalOrders;
    private Long completedOrders;
    private Long pendingOrders;
    private Long failedOrders;
    private Long cancelledOrders;

    // Thống kê theo payment method
    // Key: payment method name, Value: total amount
    private Map<String, BigDecimal> revenueByMethod;

    // Thống kê theo status
    // Key: status, Value: số lượng orders
    private Map<String, Long> ordersByStatus;

    // Conversion rate
    private Double completionRate; // completedOrders / totalOrders * 100
}
