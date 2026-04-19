package com.ev.customer_service.enums;

/**
 * Mức độ nghiêm trọng của phản hồi
 */
public enum ComplaintSeverity {
    LOW("Thấp", 3),          // Xử lý trong 7 ngày
    MEDIUM("Trung bình", 2),  // Xử lý trong 3 ngày
    HIGH("Cao", 1),           // Xử lý trong 24h
    CRITICAL("Khẩn cấp", 0);  // Xử lý ngay lập tức

    private final String displayName;
    private final int priority; // 0 = highest priority

    ComplaintSeverity(String displayName, int priority) {
        this.displayName = displayName;
        this.priority = priority;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getPriority() {
        return priority;
    }
}
