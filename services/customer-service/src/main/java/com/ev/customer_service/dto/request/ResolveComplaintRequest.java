package com.ev.customer_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO để đánh dấu phản hồi đã giải quyết xong
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResolveComplaintRequest {

    // Giải pháp xử lý nội bộ (dành cho nhân viên/ghi chú)
    private String internalResolution;

    @NotBlank(message = "Customer message is required")
    private String customerMessage; // Thông điệp gửi cho khách hàng qua email

    private String resolvedByStaffId;
    private String resolvedByStaffName;

    private Boolean sendNotification = true; // Có gửi thông báo cho khách hàng không

    // DEPRECATED: Giữ lại để tương thích ngược
    @Deprecated
    private String resolution;
}
