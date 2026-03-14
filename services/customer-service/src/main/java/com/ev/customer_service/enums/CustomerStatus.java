package com.ev.customer_service.enums;

/**
 * Customer Status Enum - Trạng thái khách hàng trong hệ thống CRM
 * 
 * NEW: Khách hàng mới tạo, chưa có tương tác
 * POTENTIAL: Khách hàng tiềm năng, đang quan tâm đến sản phẩm
 * PURCHASED: Khách hàng đã mua xe
 * INACTIVE: Khách hàng không hoạt động
 */
public enum CustomerStatus {
    NEW("Khách hàng mới"),
    POTENTIAL("Khách hàng tiềm năng"),
    PURCHASED("Đã mua xe"),
    INACTIVE("Không hoạt động");

    private final String displayName;

    CustomerStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
