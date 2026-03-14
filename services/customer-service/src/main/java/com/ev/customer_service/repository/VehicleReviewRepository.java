package com.ev.customer_service.repository;

import com.ev.customer_service.entity.VehicleReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleReviewRepository extends JpaRepository<VehicleReview, Long> {

    /**
     * Find all approved reviews for a vehicle model
     */
    List<VehicleReview> findByModelIdAndStatusOrderByCreatedAtDesc(Long modelId, String status);

    /**
     * Find all approved reviews for a specific variant
     */
    List<VehicleReview> findByVariantIdAndStatusOrderByCreatedAtDesc(Long variantId, String status);

    /**
     * Find all reviews by customer
     */
    List<VehicleReview> findByCustomerCustomerIdOrderByCreatedAtDesc(Long customerId);

    /**
     * Check if customer already reviewed this model
     */
    boolean existsByCustomerCustomerIdAndModelId(Long customerId, Long modelId);

    /**
     * Get average rating for a model
     */
    @Query("SELECT AVG(r.rating) FROM VehicleReview r WHERE r.modelId = :modelId AND r.status = 'APPROVED'")
    Double getAverageRatingByModelId(@Param("modelId") Long modelId);

    /**
     * Get review count by model
     */
    @Query("SELECT COUNT(r) FROM VehicleReview r WHERE r.modelId = :modelId AND r.status = 'APPROVED'")
    Long countApprovedReviewsByModelId(@Param("modelId") Long modelId);

    /**
     * Get rating distribution for a model
     */
    @Query("SELECT r.rating, COUNT(r) FROM VehicleReview r WHERE r.modelId = :modelId AND r.status = 'APPROVED' GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> getRatingDistributionByModelId(@Param("modelId") Long modelId);

    /**
     * Find pending reviews (for admin moderation)
     */
    List<VehicleReview> findByStatusOrderByCreatedAtAsc(String status);
}
