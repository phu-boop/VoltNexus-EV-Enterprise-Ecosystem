package com.ev.customer_service.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PublicTestDriveRequest {

    @NotNull(message = "Dealer ID is required")
    private String dealerId; // Binary UUID as hex string

    @NotNull(message = "Model ID is required")
    private Long modelId;

    private Long variantId; // Optional

    private String vehicleModelName;
    private String vehicleVariantName;

    @NotBlank(message = "Customer name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String customerName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Invalid phone number format")
    private String customerPhone;

    @Email(message = "Invalid email format")
    private String customerEmail;

    @NotNull(message = "Appointment date is required")
    @Future(message = "Appointment date must be in the future")
    private LocalDateTime appointmentDate;
    
    private String appointmentTime; // Time slot: "09:00 - 11:00"

    @Min(value = 15, message = "Duration must be at least 15 minutes")
    @Max(value = 240, message = "Duration cannot exceed 240 minutes")
    private Integer durationMinutes;

    @NotBlank(message = "Test drive location is required")
    private String testDriveLocation;

    private String customerNotes;
    
    // ProfileId from logged-in user (UUID from user-service)
    private String profileId;
}
