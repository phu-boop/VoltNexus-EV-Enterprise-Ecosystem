package com.ev.customer_service.controller;

import com.ev.customer_service.dto.request.VehicleReviewRequest;
import com.ev.customer_service.dto.response.ApiResponse;
import com.ev.customer_service.dto.response.VehicleRatingSummary;
import com.ev.customer_service.dto.response.VehicleReviewResponse;
import com.ev.customer_service.service.VehicleReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customers/api/reviews")
@RequiredArgsConstructor
@Slf4j
public class VehicleReviewController {

    private final VehicleReviewService reviewService;

    /**
     * Create a new review (customer only)
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<VehicleReviewResponse>> createReview(
            @Valid @RequestBody VehicleReviewRequest request) {
        log.info("Creating review for model {} by customer {}", request.getModelId(), request.getCustomerId());
        VehicleReviewResponse response = reviewService.createReview(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted successfully. It will be visible after approval.", response));
    }

    /**
     * Get all approved reviews for a vehicle model (public)
     */
    @GetMapping("/model/{modelId}")
    public ResponseEntity<ApiResponse<List<VehicleReviewResponse>>> getReviewsByModel(
            @PathVariable Long modelId) {
        log.info("Fetching approved reviews for model: {}", modelId);
        List<VehicleReviewResponse> reviews = reviewService.getApprovedReviewsByModel(modelId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    /**
     * Get rating summary for a vehicle model (public)
     */
    @GetMapping("/model/{modelId}/summary")
    public ResponseEntity<ApiResponse<VehicleRatingSummary>> getRatingSummary(
            @PathVariable Long modelId) {
        log.info("Fetching rating summary for model: {}", modelId);
        VehicleRatingSummary summary = reviewService.getRatingSummary(modelId);
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    /**
     * Get customer's own reviews
     */
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'DEALER_STAFF')")
    public ResponseEntity<ApiResponse<List<VehicleReviewResponse>>> getCustomerReviews(
            @PathVariable Long customerId) {
        log.info("Fetching reviews for customer: {}", customerId);
        List<VehicleReviewResponse> reviews = reviewService.getCustomerReviews(customerId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    /**
     * Mark review as helpful
     */
    @PostMapping("/{reviewId}/helpful")
    public ResponseEntity<ApiResponse<Void>> markHelpful(@PathVariable Long reviewId) {
        log.info("Marking review {} as helpful", reviewId);
        reviewService.markHelpful(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review marked as helpful", null));
    }

    /**
     * Approve review (admin/staff only)
     */
    @PutMapping("/{reviewId}/approve")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<VehicleReviewResponse>> approveReview(
            @PathVariable Long reviewId,
            @RequestParam String approvedBy) {
        log.info("Approving review {} by {}", reviewId, approvedBy);
        VehicleReviewResponse response = reviewService.approveReview(reviewId, approvedBy);
        return ResponseEntity.ok(ApiResponse.success("Review approved successfully", response));
    }

    /**
     * Get all reviews (admin only)
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<VehicleReviewResponse>>> getAllReviews() {
        log.info("Fetching all reviews for admin");
        List<VehicleReviewResponse> reviews = reviewService.getAllReviews();
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    /**
     * Get reviews by status (admin only)
     */
    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<VehicleReviewResponse>>> getReviewsByStatus(
            @PathVariable String status) {
        log.info("Fetching reviews with status: {}", status);
        List<VehicleReviewResponse> reviews = reviewService.getReviewsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    /**
     * Reject review (admin/staff only)
     */
    @PutMapping("/{reviewId}/reject")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<VehicleReviewResponse>> rejectReview(
            @PathVariable Long reviewId,
            @RequestParam String rejectedBy) {
        log.info("Rejecting review {} by {}", reviewId, rejectedBy);
        VehicleReviewResponse response = reviewService.rejectReview(reviewId, rejectedBy);
        return ResponseEntity.ok(ApiResponse.success("Review rejected", response));
    }

    /**
     * Hide review (admin/staff only)
     */
    @PutMapping("/{reviewId}/hide")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<VehicleReviewResponse>> hideReview(
            @PathVariable Long reviewId,
            @RequestParam String hiddenBy) {
        log.info("Hiding review {} by {}", reviewId, hiddenBy);
        VehicleReviewResponse response = reviewService.hideReview(reviewId, hiddenBy);
        return ResponseEntity.ok(ApiResponse.success("Review hidden", response));
    }
}
