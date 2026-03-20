package com.ev.customer_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO cho thống kê lịch hẹn lái thử
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestDriveStatisticsResponse {

    private Long totalAppointments;
    private Long scheduledCount;
    private Long confirmedCount;
    private Long completedCount;
    private Long cancelledCount;
    private Double completionRate; // Tỷ lệ hoàn thành (%)
    private Double cancellationRate; // Tỷ lệ hủy (%)
    private Map<String, Long> appointmentsByModel; // Thống kê theo mẫu xe
    private Map<String, Long> appointmentsByStaff; // Thống kê theo nhân viên
    private Map<String, Long> appointmentsByDay; // Thống kê theo ngày
}
