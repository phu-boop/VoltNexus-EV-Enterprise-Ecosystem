package com.ev.sales_service.enums;

public enum PromotionStatus {
    DRAFT,      // Mới tạo chưa duyệt
    NEAR,       // Đã duyệt nhưng chưa tới hạn
    ACTIVE,     // Đang áp dụng
    INACTIVE,   // Tạm ngưng
    EXPIRED,    // Hết hạn
    DELETED     // Đã xóa
}