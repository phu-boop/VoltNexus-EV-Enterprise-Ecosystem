package com.ev.customer_service.dto.request;

import com.ev.customer_service.enums.ComplaintChannel;
import com.ev.customer_service.enums.ComplaintSeverity;
import com.ev.customer_service.enums.ComplaintType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO để tạo phản hồi/khiếu nại mới
 * Dealer Staff ghi nhận phản hồi từ khách hàng
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateComplaintRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Dealer ID is required")
    private Long dealerId;

    private Long orderId; // Optional: Liên kết với đơn hàng nếu có

    @NotNull(message = "Complaint type is required")
    private ComplaintType complaintType;

    @NotNull(message = "Severity is required")
    private ComplaintSeverity severity;

    private ComplaintChannel channel; // Kênh nhận phản hồi

    @NotBlank(message = "Description is required")
    private String description;

    // Thông tin người tạo (từ JWT hoặc frontend)
    private String createdByStaffId;
    private String createdByStaffName;
}
