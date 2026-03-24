package com.ev.customer_service.service;

import com.ev.common_lib.exception.AppException;
import com.ev.customer_service.dto.request.VehicleReviewRequest;
import com.ev.customer_service.dto.response.VehicleRatingSummary;
import com.ev.customer_service.dto.response.VehicleReviewResponse;
import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.entity.VehicleReview;
import com.ev.customer_service.repository.CustomerRepository;
import com.ev.customer_service.repository.VehicleReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleReviewServiceTest {

    @Mock
    private VehicleReviewRepository reviewRepository;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private VehicleReviewService vehicleReviewService;

    private Customer customer;
    private VehicleReview review;
    private VehicleReviewRequest reviewRequest;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setCustomerId(1L);
        customer.setFirstName("John");
        customer.setLastName("Doe");

        review = new VehicleReview();
        review.setReviewId(1L);
        review.setCustomer(customer);
        review.setModelId(101L);
        review.setRating(5);
        review.setStatus("PENDING");

        reviewRequest = new VehicleReviewRequest();
        reviewRequest.setCustomerId(1L);
        reviewRequest.setModelId(101L);
        reviewRequest.setRating(5);
        reviewRequest.setTitle("Excellent!");
        reviewRequest.setReviewText("Great car.");
    }

    @Nested
    @DisplayName("Tạo đánh giá xe")
    class CreateReview {
        @Test
        @DisplayName("Tạo thành công")
        void createReview_success() {
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            when(reviewRepository.existsByCustomerCustomerIdAndModelId(1L, 101L)).thenReturn(false);
            when(reviewRepository.save(any(VehicleReview.class))).thenReturn(review);

            VehicleReviewResponse response = vehicleReviewService.createReview(reviewRequest);

            assertThat(response).isNotNull();
            verify(reviewRepository).save(any(VehicleReview.class));
            assertThat(response.getStatus()).isEqualTo("PENDING");
        }

        @Test
        @DisplayName("Đã đánh giá rồi → ném AppException")
        void createReview_duplicate() {
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            when(reviewRepository.existsByCustomerCustomerIdAndModelId(1L, 101L)).thenReturn(true);

            assertThatThrownBy(() -> vehicleReviewService.createReview(reviewRequest))
                    .isInstanceOf(AppException.class);
        }
    }

    @Nested
    @DisplayName("Quản lý trạng thái đánh giá")
    class StatusManagement {
        @Test
        @DisplayName("Phê duyệt đánh giá")
        void approveReview_success() {
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
            when(reviewRepository.save(any(VehicleReview.class))).thenReturn(review);

            VehicleReviewResponse response = vehicleReviewService.approveReview(1L, "ADMIN-1");

            assertThat(response.getStatus()).isEqualTo("APPROVED");
            assertThat(response.getIsApproved()).isTrue();
            verify(reviewRepository).save(review);
        }

        @Test
        @DisplayName("Từ chối đánh giá")
        void rejectReview_success() {
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
            when(reviewRepository.save(any(VehicleReview.class))).thenReturn(review);

            VehicleReviewResponse response = vehicleReviewService.rejectReview(1L, "ADMIN-1");

            assertThat(response.getStatus()).isEqualTo("REJECTED");
            assertThat(response.getIsApproved()).isFalse();
        }

        @Test
        @DisplayName("Ẩn đánh giá")
        void hideReview_success() {
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
            when(reviewRepository.save(any(VehicleReview.class))).thenReturn(review);

            VehicleReviewResponse response = vehicleReviewService.hideReview(1L, "ADMIN-1");

            assertThat(response.getStatus()).isEqualTo("HIDDEN");
        }
    }

    @Nested
    @DisplayName("Thống kê & Tìm kiếm")
    class SummaryAndSearch {
        @Test
        @DisplayName("Lấy tóm tắt đánh giá (Rating Summary)")
        void getRatingSummary_success() {
            when(reviewRepository.getAverageRatingByModelId(101L)).thenReturn(4.5);
            when(reviewRepository.countApprovedReviewsByModelId(101L)).thenReturn(10L);
            when(reviewRepository.getRatingDistributionByModelId(101L)).thenReturn(List.of(
                    new Object[] { 5, 6L },
                    new Object[] { 4, 4L }));

            VehicleRatingSummary summary = vehicleReviewService.getRatingSummary(101L);

            assertThat(summary).isNotNull();
            assertThat(summary.getAverageRating()).isEqualTo(4.5);
            assertThat(summary.getTotalReviews()).isEqualTo(10L);
            assertThat(summary.getRatingDistribution()).containsEntry(5, 6L);
            assertThat(summary.getRatingPercentages()).containsEntry(5, 60.0);
        }

        @Test
        @DisplayName("Đánh dấu hữu ích (Helpful)")
        void markHelpful_success() {
            review.setHelpfulCount(5);
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

            vehicleReviewService.markHelpful(1L);

            assertThat(review.getHelpfulCount()).isEqualTo(6);
            verify(reviewRepository).save(review);
        }
    }
}
