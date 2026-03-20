package com.ev.customer_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho Calendar View - hiển thị lịch hẹn dạng lịch
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestDriveCalendarResponse {

    private Long appointmentId;
    private String title; // Ví dụ: "Lái thử VinFast VF8 - Nguyễn Văn A"
    private LocalDateTime start; // Thời gian bắt đầu
    private LocalDateTime end; // Thời gian kết thúc
    private String status;
    private String statusColor; // Màu sắc cho status (frontend)
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private Long modelId;
    private String modelName;
    private Long variantId;
    private String variantName;
    private String staffId; // UUID
    private String staffName;
    private String location;
    private String customerNotes;
    private String staffNotes;
    
    /**
     * Tự động set màu dựa trên status
     */
    public void setStatusWithColor(String status) {
        this.status = status;
        switch (status) {
            case "SCHEDULED":
                this.statusColor = "#FFA500"; // Orange
                break;
            case "CONFIRMED":
                this.statusColor = "#4CAF50"; // Green
                break;
            case "COMPLETED":
                this.statusColor = "#2196F3"; // Blue
                break;
            case "CANCELLED":
                this.statusColor = "#F44336"; // Red
                break;
            default:
                this.statusColor = "#9E9E9E"; // Grey
        }
    }
}
