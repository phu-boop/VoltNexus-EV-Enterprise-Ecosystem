package com.ev.inventory_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InventoryDashboardStatsDto {
    private long totalUnits; // Tổng số lượng xe trong kho trung tâm (available)
    private long lowStockVariants; // Số lượng sản phẩm (variants) có trạng thái LOW_STOCK
    private long outOfStockVariants; // Số lượng sản phẩm (variants) có trạng thái OUT_OF_STOCK
    private long pendingAllocations; // Số lượng cảnh báo hoặc yêu cầu đang chờ xử lý
}
