package com.ev.customer_service.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO để cập nhật lịch hẹn lái thử
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTestDriveRequest {

    private Long modelId;
    
    private Long variantId;
    
    private String staffId; // UUID
    
    @Future(message = "Appointment date must be in the future")
    private LocalDateTime appointmentDate;
    
    private String appointmentTime; // Time slot: "09:00 - 11:00"
    
    @Min(value = 15, message = "Duration must be at least 15 minutes")
    private Integer durationMinutes;
    
    private String testDriveLocation;
    
    private String staffNotes;
    
    private String updatedBy; // Email người cập nhật (có thể lấy từ JWT)
}
