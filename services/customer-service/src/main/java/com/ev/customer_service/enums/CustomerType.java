package com.ev.customer_service.enums;

/**
 * Customer Type Enum - Loại khách hàng
 * 
 * INDIVIDUAL: Khách hàng cá nhân
 * CORPORATE: Khách hàng doanh nghiệp
 */
public enum CustomerType {
    INDIVIDUAL("Cá nhân"),
    CORPORATE("Doanh nghiệp");

    private final String displayName;

    CustomerType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
