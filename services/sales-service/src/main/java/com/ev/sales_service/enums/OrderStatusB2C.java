package com.ev.sales_service.enums;

public enum OrderStatusB2C {
     /** Đơn hàng mới được tạo, chưa được duyệt */
    PENDING,

    /** Đơn hàng đã được them oderitem theo yeu cau cuar khach hang */
    EDITED,

    /** Đơn hàng đã được quản lý duyệt để xử lý tiếp */
    APPROVED,

    /** Khách hàng đã xác nhận đơn hàng */
    CONFIRMED,

    /** Khách hàng đã từ chối xác nhận đơn hàng */
    REJECTED,

    /** Hợp đồng hoàng thành mới tiếp tục "status SIGNED" */
    /** Đơn hàng đang trong quá trình sản xuất / chuẩn bị hàng */
    IN_PRODUCTION,

    /** Đơn hàng đã được giao thành công đến khách hàng */
    /**commplete */
    DELIVERED,
    /** Đơn hàng đã bị hủy (do khách hàng hoặc hệ thống) */
    CANCELLED,
}
