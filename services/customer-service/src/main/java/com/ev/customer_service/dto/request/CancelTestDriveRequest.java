package com.ev.customer_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO để hủy lịch hẹn lái thử
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CancelTestDriveRequest {

    @NotBlank(message = "Cancellation reason is required")
    private String cancellationReason;
    
    private String cancelledBy; // Email người hủy (có thể lấy từ JWT)
}
