package com.ev.sales_service.dto.response;

import com.ev.sales_service.enums.OrderStatusB2B;
import com.ev.sales_service.enums.OrderStatusB2C;
import com.ev.sales_service.enums.PaymentStatus;
import com.ev.sales_service.enums.SaleOderType;
import com.ev.sales_service.enums.ContractStatus; // Giả sử bạn có enum này
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class SalesOrderDtoB2B {

    // Từ SalesOrder
    private UUID orderId;
    private UUID dealerId;
    private Long customerId; // Có thể null nếu là B2B order
    private UUID staffId;
    private LocalDateTime orderDate;
    private LocalDateTime deliveryDate;
    private OrderStatusB2B orderStatus; // Status cho B2B orders
    private OrderStatusB2C orderStatusB2C; // Status cho B2C orders (có thể null nếu là B2B)
    private PaymentStatus paymentStatus; // Trạng thái thanh toán
    private SaleOderType typeOder; // B2B hoặc B2C
    private BigDecimal totalAmount;
    private Boolean managerApproval;
    private UUID approvedBy;
    private LocalDateTime approvalDate;

    // Từ OrderItem
    private List<OrderItemDto> orderItems;

    // Từ OrderTracking
    private List<OrderTrackingDto> orderTrackings;

    // Từ SalesContract (nếu có)
    private ContractInfoInOrderDto contractInfo;

    // Lớp con cho OrderItem
    @Data
    public static class OrderItemDto {
        private UUID orderItemId;
        private Long variantId; // Đổi tên từ modelId
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discount;
        private BigDecimal finalPrice;
    }

    // Lớp con cho OrderTracking
    @Data
    public static class OrderTrackingDto {
        private UUID trackId;
        private String status;
        private LocalDateTime updateDate;
        private String notes;
        private UUID updatedBy;
    }

    // Lớp con cho Contract
    @Data
    public static class ContractInfoInOrderDto {
        private UUID contractId;
        private LocalDateTime contractDate;
        private ContractStatus contractStatus;
        private String contractFileUrl;
    }
}
