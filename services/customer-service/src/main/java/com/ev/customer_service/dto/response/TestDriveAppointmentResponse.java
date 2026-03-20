package com.ev.customer_service.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TestDriveAppointmentResponse {
    
    private Long appointmentId;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    
    private String dealerId; // Binary UUID as hex string
    private Long modelId;
    private Long variantId;
    
    private String vehicleModelName;
    private String vehicleVariantName;
    
    private String staffId;
    private String staffName;
    
    private LocalDateTime appointmentDate;
    private Integer durationMinutes;
    private LocalDateTime endTime;
    
    private String testDriveLocation;
    private String status;
    
    private String cancellationReason;
    private String cancelledBy;
    private LocalDateTime cancelledAt;
    
    private LocalDateTime confirmedAt;
    private LocalDateTime completedAt;
    
    private String customerNotes;
    private String staffNotes;
    
    private Boolean isConfirmed;
    private Integer feedbackRating;
    private String feedbackComment;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
