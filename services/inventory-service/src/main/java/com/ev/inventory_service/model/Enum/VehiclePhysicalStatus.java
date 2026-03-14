package com.ev.inventory_service.model.Enum;

public enum VehiclePhysicalStatus {
    IN_PRODUCTION,      // Đang sản xuất
    IN_CENTRAL_WAREHOUSE, // Đang ở kho trung tâm
    ALLOCATED,          // Đã được gán cho một đơn hàng, chờ xuất
    IN_TRANSIT,         // Đang trên đường vận chuyển đến đại lý
    AT_DEALER,          // Đã về kho đại lý
    SOLD                // Đã bán cho khách hàng cuối
}
