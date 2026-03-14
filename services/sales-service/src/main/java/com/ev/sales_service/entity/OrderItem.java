package com.ev.sales_service.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "order_item_id", columnDefinition = "BINARY(16)")
    private UUID orderItemId;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private SalesOrder salesOrder;

    @Column(name = "variant_id", nullable = false)
    private Long variantId;

    @Column(name = "variant_name", length = 200)
    private String variantName;

    @Column(name = "model_name", length = 200)
    private String modelName;

    @Column(name = "color", length = 100)
    private String color;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "unit_price", precision = 15, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "discount", precision = 5, scale = 2)
    private BigDecimal discount;

    @Column(name = "final_price", precision = 15, scale = 2)
    private BigDecimal finalPrice;
}