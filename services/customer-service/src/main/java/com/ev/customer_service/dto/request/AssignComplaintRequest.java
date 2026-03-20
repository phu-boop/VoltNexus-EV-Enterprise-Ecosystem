package com.ev.customer_service.dto.request;

import com.ev.customer_service.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO để Manager phân công xử lý phản hồi
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignComplaintRequest {

    private String assignedStaffId; // UUID nhân viên được gán
    private String assignedStaffName; // Tên nhân viên

    private ComplaintStatus status; // Chuyển trạng thái (thường là IN_PROGRESS)

    private String internalNotes; // Ghi chú nội bộ, yêu cầu xử lý
}
