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
public class TestDriveResponse {

    private Long appointmentId;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String dealerId; // Binary UUID as hex string
    private String dealerName;
    private Long modelId;
    private String modelName;
    private Long variantId;
    private String variantName;
    
    // Denormalized names for display
    private String vehicleModelName; // "VF 8S"
    private String vehicleVariantName; // "Plus 4WD (Màu lỏ vãi)"
    
    private String staffId; // UUID
    private String staffName;
    private String staffPhone;
    private LocalDateTime appointmentDate;
    private String appointmentTime; // Time slot: "09:00 - 11:00"
    private Integer durationMinutes;
    private LocalDateTime endTime; // Tính toán từ appointmentDate + durationMinutes
    private String testDriveLocation;
    private String status;
    private String cancellationReason;
    private String cancelledBy;
    private LocalDateTime cancelledAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime completedAt;
    private String customerNotes;
    private String staffNotes;
    private Boolean notificationSent;
    private Boolean reminderSent;
    
    // Confirmation tracking fields
    private Boolean isConfirmed;
    private LocalDateTime confirmationSentAt;
    private LocalDateTime confirmationExpiresAt;
    private LocalDateTime firstReminderSentAt;
    private LocalDateTime secondReminderSentAt;
    
    private Integer feedbackRating;
    private String feedbackComment;
    private String createdBy;
    private LocalDateTime createdAt;
    private String updatedBy;
    private LocalDateTime updatedAt;
}
