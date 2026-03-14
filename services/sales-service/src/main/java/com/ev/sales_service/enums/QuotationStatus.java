package com.ev.sales_service.enums;

public enum QuotationStatus {
    DRAFT,      // Mới tạo, bản nháp, chưa gửi đi
    PENDING,    // Đã gửi cho quản lý duyệt
    APPROVED,   // Quản lý đã duyệt
    ACCEPTED,   // Đã chấp nhận (tương đương APPROVED, giữ lại để tương thích với dữ liệu cũ)
    COMPLETE,   // Đã hoàn thành (tương đương ACCEPTED, giữ lại để tương thích với dữ liệu cũ)
    REJECTED,   // Quản lý đã từ chối
    EXPIRED,     // Hết hạn
    SENT,
}
