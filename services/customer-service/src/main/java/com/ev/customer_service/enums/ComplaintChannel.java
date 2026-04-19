package com.ev.customer_service.enums;

/**
 * Kênh nhận phản hồi
 */
public enum ComplaintChannel {
    IN_STORE("Tại đại lý"),
    EMAIL("Qua email"),
    WEBSITE("Qua website"),
    PHONE("Qua điện thoại"),
    SOCIAL_MEDIA("Mạng xã hội"),
    OTHER("Khác");

    private final String displayName;

    ComplaintChannel(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
