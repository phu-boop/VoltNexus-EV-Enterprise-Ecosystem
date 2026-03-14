package com.ev.customer_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "vehicle_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Long reviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "model_id", nullable = false)
    private Long modelId;

    @Column(name = "variant_id")
    private Long variantId;

    // Denormalized vehicle info for display
    @Column(name = "vehicle_model_name", length = 200)
    private String vehicleModelName;

    @Column(name = "vehicle_variant_name", length = 200)
    private String vehicleVariantName;

    @Column(name = "rating", nullable = false)
    private Integer rating; // 1-5 stars

    @Column(name = "title", length = 200)
    private String title;

    @Column(name = "review_text", columnDefinition = "TEXT")
    private String reviewText;

    // Review aspects - optional detailed ratings
    @Column(name = "performance_rating")
    private Integer performanceRating; // 1-5

    @Column(name = "comfort_rating")
    private Integer comfortRating; // 1-5

    @Column(name = "design_rating")
    private Integer designRating; // 1-5

    @Column(name = "value_rating")
    private Integer valueRating; // 1-5

    @Column(name = "is_verified_purchase")
    private Boolean isVerifiedPurchase = false; // Đã mua xe chưa

    @Column(name = "is_approved")
    private Boolean isApproved = false; // Admin duyệt chưa

    @Column(name = "helpful_count")
    private Integer helpfulCount = 0; // Số người thấy review hữu ích

    @Column(name = "reported_count")
    private Integer reportedCount = 0; // Số lần bị report

    @Column(name = "status", length = 20)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, HIDDEN

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    // Helper methods
    public boolean isActive() {
        return "APPROVED".equals(status);
    }
}
