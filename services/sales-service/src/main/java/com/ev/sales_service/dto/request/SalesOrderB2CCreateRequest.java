package com.ev.sales_service.dto.request;

import com.ev.sales_service.enums.OrderStatusB2C;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class SalesOrderB2CCreateRequest {
    // Thông tin cơ bản
    private UUID dealerId;
    private Long customerId;
    private UUID staffId;
    private Long modelId;
    private Long variantId;

    // Thông tin giá cả
    private BigDecimal basePrice;
    private BigDecimal discountAmount;
    private BigDecimal finalPrice;
    private BigDecimal totalAmount;
    private BigDecimal downPayment;

    // Thông tin thời gian
    private LocalDateTime orderDate;
    private LocalDateTime deliveryDate;
    private LocalDateTime validUntil;

    // Trạng thái và xét duyệt
    private OrderStatusB2C orderStatusB2C;
    private Boolean managerApproval;
    private UUID approvedBy;
    private LocalDateTime approvalDate;

    // Điều khoản và điều kiện
    private String termsConditions;

    // Thông tin sản phẩm chi tiết
    private List<OrderItemRequest> orderItems;

    // Thông tin khuyến mãi áp dụng
    private List<UUID> promotionIds;

    // Thông tin hợp đồng (nếu có)
    private SalesContractRequest salesContract;

    // Ghi chú đặc biệt
    private String specialNotes;

    // Phương thức thanh toán
    private String paymentMethod;
    private Integer installmentMonths; // Số tháng trả góp (nếu có)

    // Thông tin giao hàng
    private String deliveryAddress;
    private String contactPhone;
    private String contactEmail;

    // Thông tin bảo hiểm và dịch vụ đi kèm
    private Boolean includeInsurance;
    private Boolean includeMaintenance;
    private String additionalServices;

    @Data
    public static class OrderItemRequest {
        private Long variantId;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discount;
        private String itemNotes;
    }

    @Data
    public static class SalesContractRequest {
        private String contractTerms;
        private String digitalSignature;
        private String contractFileUrl;
    }
}