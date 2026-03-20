package com.ev.sales_service.entity;

import com.ev.sales_service.enums.OrderStatusB2B;
import com.ev.sales_service.enums.OrderStatusB2C;
import com.ev.sales_service.enums.PaymentStatus;
import com.ev.sales_service.enums.SaleOderType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sales_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "order_id", columnDefinition = "BINARY(16)")
    private UUID orderId;

    @OneToOne
    @JoinColumn(name = "quotation_id")
    private Quotation quotation;

    @Column(name = "dealer_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID dealerId;

    @Column(name = "customer_id", nullable = true)
    private Long customerId; // Đã migrate từ UUID sang Long, có thể null cho B2B orders

    @Column(name = "staff_id", columnDefinition = "BINARY(16)")
    private UUID staffId;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_phone")
    private String customerPhone;

    @Column(name = "customer_email")
    private String customerEmail;

    @Column(name = "shipping_address", columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    @Column(name = "delivery_date")
    private LocalDateTime deliveryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", length = 50)
    private OrderStatusB2B orderStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status_b2c", length = 50)
    private OrderStatusB2C orderStatusB2C;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "down_payment", precision = 15, scale = 2)
    private BigDecimal downPayment;

    @Column(name = "manager_approval")
    private Boolean managerApproval;

    @Column(name = "approved_by", columnDefinition = "BINARY(16)")
    private UUID approvedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_oder", length = 50)
    private SaleOderType typeOder;

    @Column(name = "approval_date")
    private LocalDateTime approvalDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "payment_method", length = 100)
    private String paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 50)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.NONE;

    // SalesOrder.java
    @OneToOne(mappedBy = "salesOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @EqualsAndHashCode.Exclude
    private SalesContract salesContract;

    @OneToMany(mappedBy = "salesOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<OrderItem> orderItems = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "salesOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<OrderTracking> orderTrackings = new java.util.ArrayList<>();
}
