package com.ev.customer_service.service;

import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.customer_service.dto.request.VehicleReviewRequest;
import com.ev.customer_service.dto.response.VehicleRatingSummary;
import com.ev.customer_service.dto.response.VehicleReviewResponse;
import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.entity.VehicleReview;
import com.ev.customer_service.exception.ResourceNotFoundException;
import com.ev.customer_service.repository.CustomerRepository;
import com.ev.customer_service.repository.VehicleReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleReviewService {

    private final VehicleReviewRepository reviewRepository;
    private final CustomerRepository customerRepository;

    @Transactional
    public VehicleReviewResponse createReview(VehicleReviewRequest request) {
        log.info("Creating review for model {} by customer {}", request.getModelId(), request.getCustomerId());

        // Validate customer exists
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));

        // Check if customer already reviewed this model
        if (reviewRepository.existsByCustomerCustomerIdAndModelId(request.getCustomerId(), request.getModelId())) {
            throw new AppException(ErrorCode.DATA_ALREADY_EXISTS);
        }

        VehicleReview review = new VehicleReview();
        review.setCustomer(customer);
        review.setModelId(request.getModelId());
        review.setVariantId(request.getVariantId());
        review.setVehicleModelName(request.getVehicleModelName());
        review.setVehicleVariantName(request.getVehicleVariantName());
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setReviewText(request.getReviewText());
        review.setPerformanceRating(request.getPerformanceRating());
        review.setComfortRating(request.getComfortRating());
        review.setDesignRating(request.getDesignRating());
        review.setValueRating(request.getValueRating());
        review.setStatus("PENDING"); // Pending admin approval
        review.setIsApproved(false);
        review.setIsVerifiedPurchase(false); // TODO: Check if customer purchased this vehicle
        review.setHelpfulCount(0);
        review.setReportedCount(0);

        VehicleReview savedReview = reviewRepository.save(review);
        log.info("Review created with ID: {}", savedReview.getReviewId());

        return mapToResponse(savedReview);
    }

    @Transactional(readOnly = true)
    public List<VehicleReviewResponse> getApprovedReviewsByModel(Long modelId) {
        return reviewRepository.findByModelIdAndStatusOrderByCreatedAtDesc(modelId, "APPROVED")
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VehicleReviewResponse> getCustomerReviews(Long customerId) {
        return reviewRepository.findByCustomerCustomerIdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VehicleRatingSummary getRatingSummary(Long modelId) {
        Double avgRating = reviewRepository.getAverageRatingByModelId(modelId);
        Long totalReviews = reviewRepository.countApprovedReviewsByModelId(modelId);
        List<Object[]> distribution = reviewRepository.getRatingDistributionByModelId(modelId);

        Map<Integer, Long> ratingDistribution = new HashMap<>();
        Map<Integer, Double> ratingPercentages = new HashMap<>();

        // Initialize all ratings
        for (int i = 1; i <= 5; i++) {
            ratingDistribution.put(i, 0L);
            ratingPercentages.put(i, 0.0);
        }

        // Fill actual data
        for (Object[] row : distribution) {
            Integer rating = (Integer) row[0];
            Long count = (Long) row[1];
            ratingDistribution.put(rating, count);
            
            if (totalReviews > 0) {
                ratingPercentages.put(rating, (count * 100.0) / totalReviews);
            }
        }

        return VehicleRatingSummary.builder()
                .modelId(modelId)
                .averageRating(avgRating != null ? avgRating : 0.0)
                .totalReviews(totalReviews)
                .ratingDistribution(ratingDistribution)
                .ratingPercentages(ratingPercentages)
                .build();
    }

    @Transactional
    public VehicleReviewResponse approveReview(Long reviewId, String approvedBy) {
        VehicleReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        review.setStatus("APPROVED");
        review.setIsApproved(true);
        review.setApprovedAt(LocalDateTime.now());
        review.setApprovedBy(approvedBy);

        VehicleReview savedReview = reviewRepository.save(review);
        return mapToResponse(savedReview);
    }

    @Transactional
    public void markHelpful(Long reviewId) {
        VehicleReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        review.setHelpfulCount(review.getHelpfulCount() + 1);
        reviewRepository.save(review);
    }

    @Transactional(readOnly = true)
    public List<VehicleReviewResponse> getAllReviews() {
        return reviewRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VehicleReviewResponse> getReviewsByStatus(String status) {
        return reviewRepository.findByStatusOrderByCreatedAtAsc(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public VehicleReviewResponse rejectReview(Long reviewId, String rejectedBy) {
        VehicleReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        review.setStatus("REJECTED");
        review.setIsApproved(false);
        review.setApprovedBy(rejectedBy);
        review.setApprovedAt(LocalDateTime.now());

        VehicleReview savedReview = reviewRepository.save(review);
        return mapToResponse(savedReview);
    }

    @Transactional
    public VehicleReviewResponse hideReview(Long reviewId, String hiddenBy) {
        VehicleReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        review.setStatus("HIDDEN");
        review.setApprovedBy(hiddenBy);
        review.setApprovedAt(LocalDateTime.now());

        VehicleReview savedReview = reviewRepository.save(review);
        return mapToResponse(savedReview);
    }

    private VehicleReviewResponse mapToResponse(VehicleReview review) {
        return VehicleReviewResponse.builder()
                .reviewId(review.getReviewId())
                .customerId(review.getCustomer().getCustomerId())
                .customerName(review.getCustomer().getFirstName() + " " + review.getCustomer().getLastName())
                .modelId(review.getModelId())
                .variantId(review.getVariantId())
                .vehicleModelName(review.getVehicleModelName())
                .vehicleVariantName(review.getVehicleVariantName())
                .rating(review.getRating())
                .title(review.getTitle())
                .reviewText(review.getReviewText())
                .performanceRating(review.getPerformanceRating())
                .comfortRating(review.getComfortRating())
                .designRating(review.getDesignRating())
                .valueRating(review.getValueRating())
                .isVerifiedPurchase(review.getIsVerifiedPurchase())
                .isApproved(review.getIsApproved())
                .helpfulCount(review.getHelpfulCount())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
