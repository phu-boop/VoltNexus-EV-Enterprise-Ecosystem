package com.ev.customer_service.dto.request;

import com.ev.customer_service.enums.ComplaintSeverity;
import com.ev.customer_service.enums.ComplaintStatus;
import com.ev.customer_service.enums.ComplaintType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Request DTO để lọc danh sách phản hồi
 * Dealer Manager xem và filter
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintFilterRequest {

    private String dealerId; // UUID format (Required)

    private ComplaintStatus status;

    private ComplaintType complaintType;

    private ComplaintSeverity severity;

    private String assignedStaffId; // Lọc theo người phụ trách

    private Long customerId; // Lọc theo khách hàng

    private LocalDate startDate;

    private LocalDate endDate;

    // Pagination
    private Integer page = 0;
    private Integer size = 20;

    // Sorting
    private String sortBy = "createdAt"; // createdAt, severity, status
    private String sortDirection = "DESC"; // ASC, DESC
}
