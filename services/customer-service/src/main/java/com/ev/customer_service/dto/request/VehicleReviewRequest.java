package com.ev.customer_service.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleReviewRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Model ID is required")
    private Long modelId;

    private Long variantId; // Optional

    private String vehicleModelName;
    private String vehicleVariantName;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    @NotBlank(message = "Review title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Review text is required")
    @Size(min = 10, max = 2000, message = "Review text must be between 10 and 2000 characters")
    private String reviewText;

    // Optional detailed ratings
    @Min(value = 1, message = "Performance rating must be at least 1")
    @Max(value = 5, message = "Performance rating must be at most 5")
    private Integer performanceRating;

    @Min(value = 1, message = "Comfort rating must be at least 1")
    @Max(value = 5, message = "Comfort rating must be at most 5")
    private Integer comfortRating;

    @Min(value = 1, message = "Design rating must be at least 1")
    @Max(value = 5, message = "Design rating must be at most 5")
    private Integer designRating;

    @Min(value = 1, message = "Value rating must be at least 1")
    @Max(value = 5, message = "Value rating must be at most 5")
    private Integer valueRating;
}
