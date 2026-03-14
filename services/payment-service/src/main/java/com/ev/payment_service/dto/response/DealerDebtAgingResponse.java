package com.ev.payment_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Response DTO cho báo cáo công nợ đại lý theo độ tuổi (aging)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DealerDebtAgingResponse {
    private UUID dealerId;
    private String dealerName; // Có thể lấy từ Dealer Service
    private BigDecimal currentBalance; // Dư nợ hiện tại
    private BigDecimal currentPeriod; // Công nợ 0-30 ngày
    private BigDecimal period31to60; // Công nợ 31-60 ngày
    private BigDecimal period61to90; // Công nợ 61-90 ngày
    private BigDecimal over90Days; // Công nợ trên 90 ngày
    private Integer totalInvoices; // Tổng số hóa đơn
    private Integer overdueInvoices; // Số hóa đơn quá hạn
}


