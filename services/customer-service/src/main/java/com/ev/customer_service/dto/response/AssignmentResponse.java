package com.ev.customer_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO trả về sau khi phân công nhân viên thành công
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentResponse {
    private Long customerId;
    private String customerCode;
    private String customerName;
    private String assignedStaffId; // UUID string
    private String assignedStaffName;
    private LocalDateTime assignedAt;
    private String message;
}
