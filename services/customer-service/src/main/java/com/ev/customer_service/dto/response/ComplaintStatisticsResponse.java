package com.ev.customer_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Response DTO cho thống kê phản hồi
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintStatisticsResponse {

    private Long totalComplaints;

    // Thống kê theo trạng thái (individual fields - backward compatibility)
    private Long newComplaints;
    private Long inProgressComplaints;
    private Long resolvedComplaints;
    private Long closedComplaints;

    // Thống kê theo trạng thái (map format for frontend)
    private Map<String, Long> byStatus; // {"NEW": 3, "IN_PROGRESS": 2, "RESOLVED": 2, "CLOSED": 1}

    // Thống kê theo mức độ nghiêm trọng (individual fields - backward compatibility)
    private Long criticalComplaints;
    private Long highComplaints;
    private Long mediumComplaints;
    private Long lowComplaints;

    // Thống kê theo mức độ (map format for frontend)
    private Map<String, Long> bySeverity; // {"CRITICAL": 3, "HIGH": 2, "MEDIUM": 2, "LOW": 1}

    // Thống kê theo loại (renamed for consistency)
    private Map<String, Long> byType; // {"VEHICLE_QUALITY": 10, "SERVICE_ATTITUDE": 5}

    // Thống kê theo nhân viên xử lý (renamed for consistency)
    private Map<String, Long> byStaff; // {"Staff Name": count}

    // Thời gian xử lý
    private Double averageResolutionTimeHours;
    private Double averageFirstResponseTimeHours;

    // SLA metrics
    private Long overdueComplaints; // Total overdue complaints
    private Long overdueCritical; // Critical chưa xử lý quá 24h
    private Long overdueHigh; // High chưa xử lý quá 24h
}
