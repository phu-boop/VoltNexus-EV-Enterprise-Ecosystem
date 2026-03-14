package com.ev.payment_service.enums;

public enum PaymentScope {
    B2C, // Chỉ cho Khách hàng -> Đại lý
    B2B, // Chỉ cho Đại lý -> Hãng xe
    ALL  // Cho cả hai
}