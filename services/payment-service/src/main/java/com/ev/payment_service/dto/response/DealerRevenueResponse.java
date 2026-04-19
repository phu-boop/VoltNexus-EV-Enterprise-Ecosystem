package com.ev.payment_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Response DTO cho doanh thu theo đại lý
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DealerRevenueResponse {
    private UUID dealerId;
    private String dealerName; // Có thể lấy từ Dealer Service
    private BigDecimal totalRevenue; // Tổng doanh thu
    private BigDecimal totalPaid; // Tổng đã thanh toán
    private Integer totalTransactions; // Tổng số giao dịch
    private Integer totalInvoices; // Tổng số hóa đơn
}


