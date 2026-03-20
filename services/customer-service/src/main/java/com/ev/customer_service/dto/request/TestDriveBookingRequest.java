package com.ev.customer_service.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TestDriveBookingRequest {
    
    @NotNull(message = "Customer ID is required")
    private Long customerId;
    
    @NotNull(message = "Dealer ID is required")
    private String dealerId; // Binary UUID as hex string
    
    @NotNull(message = "Model ID is required")
    private Long modelId;
    
    private Long variantId; // Optional - specific variant
    
    @NotNull(message = "Appointment date is required")
    @Future(message = "Appointment date must be in the future")
    private LocalDateTime appointmentDate;
    
    @Positive(message = "Duration must be positive")
    private Integer durationMinutes = 60; // Default 60 minutes
    
    private String testDriveLocation;
    
    private String customerNotes;
    
    // Vehicle info for display (populated from vehicle-service)
    private String vehicleModelName;
    private String vehicleVariantName;
}
