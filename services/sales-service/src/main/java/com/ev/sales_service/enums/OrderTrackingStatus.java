package com.ev.sales_service.enums;

/**
 * Trạng thái tracking chi tiết cho SalesOrder B2C
 */
public enum OrderTrackingStatus {
    /** Đơn hàng mới được tạo, chưa được xử lý */
    CREATED,

    /** Đơn hàng đã được giao thành công */
    DELIVERED,

    /**phát triển sao*/
    /** Đơn hàng đã được nhân viên chỉnh sửa / thêm sản phẩm */
    EDITED,


    /** Khách hàng đã xác nhận đơn hàng */
    CONFIRMED,

    /** Khách hàng từ chối đơn hàng */
    REJECTED,

    /** Đơn hàng đang trong quá trình sản xuất / chuẩn bị hàng */
    IN_PRODUCTION,

    /** Đơn hàng đã sẵn sàng giao cho khách */
    READY_FOR_DELIVERY,

    /** Đơn hàng đã bị hủy (do khách hoặc hệ thống) */
    CANCELLED,

    /** Đơn hàng bị xoá (dành cho admin/manager) */
    DELETED,

    /** Đơn hàng bị tạm giữ / tạm dừng xử lý */
    ON_HOLD,

    /** Đơn hàng có vấn đề cần xử lý (ví dụ thiếu thông tin, lỗi hệ thống) */
    ISSUE_DETECTED
}
