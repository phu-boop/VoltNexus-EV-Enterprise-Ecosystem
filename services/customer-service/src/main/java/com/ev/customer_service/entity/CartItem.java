package com.ev.customer_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity quản lý giỏ hàng của khách hàng
 * Mỗi customer có thể có nhiều items trong giỏ hàng
 */
@Entity
@Table(name = "cart_items", indexes = {
    @Index(name = "idx_customer_id", columnList = "customer_id"),
    @Index(name = "idx_variant_id", columnList = "variant_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_item_id")
    private Long cartItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "variant_id", nullable = false)
    private Long variantId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity = 1;

    // Cached vehicle information (denormalized for performance)
    @Column(name = "vehicle_name", length = 200)
    private String vehicleName;

    @Column(name = "vehicle_color", length = 50)
    private String vehicleColor;

    @Column(name = "vehicle_image_url", length = 500)
    private String vehicleImageUrl;

    @Column(name = "unit_price", precision = 15, scale = 2)
    private BigDecimal unitPrice;

    // Optional: selected features/accessories
    @Column(name = "selected_features", columnDefinition = "TEXT")
    private String selectedFeatures; // JSON string of selected feature IDs

    @Column(name = "notes", length = 500)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Calculate total price for this cart item
     */
    public BigDecimal getTotalPrice() {
        if (unitPrice == null || quantity == null) {
            return BigDecimal.ZERO;
        }
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }

    /**
     * Pre-persist: validate quantity
     */
    @PrePersist
    @PreUpdate
    protected void validateQuantity() {
        if (quantity == null || quantity < 1) {
            quantity = 1;
        }
    }
}
