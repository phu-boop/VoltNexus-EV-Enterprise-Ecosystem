package com.ev.sales_service.enums;

/**
 * Enum cho trạng thái thanh toán của đơn hàng
 */
public enum PaymentStatus {
    /**
     * Chưa có hóa đơn hoặc chưa cần thanh toán
     */
    NONE,
    
    /**
     * Chưa thanh toán (đã có hóa đơn nhưng chưa thanh toán)
     */
    UNPAID,
    
    /**
     * Đã thanh toán một phần
     */
    PARTIALLY_PAID,
    
    /**
     * Đã thanh toán đầy đủ
     */
    PAID
}

