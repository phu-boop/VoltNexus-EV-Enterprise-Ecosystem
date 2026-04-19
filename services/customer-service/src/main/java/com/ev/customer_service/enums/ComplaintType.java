package com.ev.customer_service.enums;

/**
 * Loại phản hồi/khiếu nại
 */
public enum ComplaintType {
    VEHICLE_QUALITY("Chất lượng xe"),
    SERVICE_ATTITUDE("Thái độ phục vụ"),
    SALES_PROCESS("Quy trình bán hàng"),
    PRICING("Giá cả và chính sách"),
    DELIVERY("Giao xe"),
    AFTER_SALES("Dịch vụ sau bán hàng"),
    WARRANTY("Bảo hành"),
    OTHER("Khác");

    private final String displayName;

    ComplaintType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
