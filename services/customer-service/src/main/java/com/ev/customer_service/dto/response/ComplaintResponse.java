package com.ev.customer_service.dto.response;

import com.ev.customer_service.enums.ComplaintChannel;
import com.ev.customer_service.enums.ComplaintSeverity;
import com.ev.customer_service.enums.ComplaintStatus;
import com.ev.customer_service.enums.ComplaintType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO cho chi tiết phản hồi/khiếu nại
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintResponse {

    private Long complaintId;
    private String complaintCode;

    // Customer info
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;

    private Long dealerId;
    private Long orderId;

    private ComplaintType complaintType;
    private String complaintTypeDisplay;

    private ComplaintSeverity severity;
    private String severityDisplay;

    private ComplaintChannel channel;
    private String channelDisplay;

    private String description;

    private ComplaintStatus status;
    private String statusDisplay;

    // Assignment info
    private String assignedStaffId;
    private String assignedStaffName;

    private String internalNotes;

    // Progress tracking
    private List<ProgressUpdateInfo> progressHistory; // Parsed from JSON

    // Resolution fields
    private String internalResolution; // Giải pháp nội bộ (nhân viên)
    private String customerMessage; // Thông điệp cho khách hàng

    // DEPRECATED: Giữ lại để tương thích ngược
    @Deprecated
    private String resolution;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime resolvedDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime firstResponseAt;

    private Boolean notificationSent;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime notificationSentAt;

    // Creator info
    private String createdByStaffId;
    private String createdByStaffName;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // Helper nested class for progress updates
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProgressUpdateInfo {
        private String updateNote;
        private String updatedByStaffId;
        private String updatedByStaffName;
        
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime updatedAt;
    }
}
