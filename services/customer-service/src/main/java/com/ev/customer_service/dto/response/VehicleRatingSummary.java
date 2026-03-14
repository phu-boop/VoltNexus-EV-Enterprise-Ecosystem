package com.ev.customer_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleRatingSummary {

    private Long modelId;
    private Double averageRating;
    private Long totalReviews;
    
    // Rating distribution: star -> count
    private Map<Integer, Long> ratingDistribution;
    
    // Percentage for each star
    private Map<Integer, Double> ratingPercentages;
}
