package com.ev.customer_service.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO để ghi lại kết quả lái thử và phản hồi của khách hàng
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestDriveFeedbackRequest {

    @NotNull(message = "Feedback rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer feedbackRating; // Đánh giá 1-5 sao

    private String feedbackComment; // Cảm nhận chung của khách hàng

    private String staffNotes; // Ghi chú của nhân viên về khách hàng

    private String updatedBy; // Email nhân viên ghi kết quả
}
