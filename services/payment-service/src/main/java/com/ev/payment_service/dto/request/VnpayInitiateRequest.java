// com/ev/payment_service/dto/request/VnpayInitiateRequest.java
package com.ev.payment_service.dto.request;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public class VnpayInitiateRequest {
    private UUID orderId; // ID của SalesOrder (B2C) - Optional for booking
    private Long customerId; // Customer ID (Long) - Optional for guest booking
    private BigDecimal totalAmount; // Tổng giá trị đơn hàng (để tạo PaymentRecord)
    private BigDecimal paymentAmount; // Số tiền thanh toán lần này
    private String returnUrl; // URL frontend sẽ nhận redirect về
    private String orderInfo; // Thông tin đơn hàng hiển thị trên VNPay
    private Map<String, Object> metadata; // Metadata bổ sung cho booking

    // Thông tin khách hàng cho guest booking
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String customerIdCard;

    // --- BẮT ĐẦU THÊM GETTERS & SETTERS ---
    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getPaymentAmount() {
        return paymentAmount;
    }

    public void setPaymentAmount(BigDecimal paymentAmount) {
        this.paymentAmount = paymentAmount;
    }

    public String getReturnUrl() {
        return returnUrl;
    }

    public void setReturnUrl(String returnUrl) {
        this.returnUrl = returnUrl;
    }

    public String getOrderInfo() {
        return orderInfo;
    }

    public void setOrderInfo(String orderInfo) {
        this.orderInfo = orderInfo;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerIdCard() {
        return customerIdCard;
    }

    public void setCustomerIdCard(String customerIdCard) {
        this.customerIdCard = customerIdCard;
    }
    // --- KẾT THÚC THÊM GETTERS & SETTERS ---
}