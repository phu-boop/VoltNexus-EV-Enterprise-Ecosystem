package com.ev.customer_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignStaffRequest {

    @NotBlank(message = "Staff ID is required")
    @Pattern(
        regexp = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        message = "Staff ID must be a valid UUID format (e.g., '123e4567-e89b-12d3-a456-426614174000'). " +
                  "Please select a staff member from the dropdown instead of entering text."
    )
    private String staffId; // UUID string từ User Service

    private String note; // Ghi chú khi phân công (optional)
}
