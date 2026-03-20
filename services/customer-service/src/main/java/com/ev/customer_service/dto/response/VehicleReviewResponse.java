package com.ev.customer_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleReviewResponse {

    private Long reviewId;
    private Long customerId;
    private String customerName;
    private Long modelId;
    private Long variantId;
    private String vehicleModelName;
    private String vehicleVariantName;
    
    private Integer rating;
    private String title;
    private String reviewText;
    
    // Detailed ratings
    private Integer performanceRating;
    private Integer comfortRating;
    private Integer designRating;
    private Integer valueRating;
    
    private Boolean isVerifiedPurchase;
    private Boolean isApproved;
    private Integer helpfulCount;
    private String status;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
