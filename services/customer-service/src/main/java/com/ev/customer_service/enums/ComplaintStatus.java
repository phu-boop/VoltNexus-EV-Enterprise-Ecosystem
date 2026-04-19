package com.ev.customer_service.enums;

/**
 * Trạng thái xử lý phản hồi
 */
public enum ComplaintStatus {
    NEW("Mới nhận", "Phản hồi mới được ghi nhận, chờ phân công"),
    IN_PROGRESS("Đang xử lý", "Đang được nhân viên xử lý"),
    RESOLVED("Đã giải quyết", "Đã xử lý xong, chờ xác nhận từ khách hàng"),
    CLOSED("Đã đóng", "Hoàn tất và đóng phản hồi");

    private final String displayName;
    private final String description;

    ComplaintStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
