package com.ev.sales_service.enums;

public enum OrderStatusB2B {
    // B2B
    PENDING,        // Chờ Hãng (EVM) xác nhận
    CONFIRMED,      // Hãng đã xác nhận (đã gọi API "allocate" kho)
    IN_TRANSIT,     // Hãng đã giao hàng (đã gọi API "ship")
    DELIVERED,      // Đại lý đã nhận hàng
    CANCELLED,      // Đơn hàng đã bị hủy
    DISPUTED,       // Dành cho đại lí (Đang tranh chấp/khiếu nại)
    RETURNED_TO_CENTRAL, // Trả về kho trung tâm
}
