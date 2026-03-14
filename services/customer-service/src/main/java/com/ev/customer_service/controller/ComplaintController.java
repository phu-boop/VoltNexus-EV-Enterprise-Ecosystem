package com.ev.customer_service.controller;

import com.ev.customer_service.dto.request.*;
import com.ev.customer_service.dto.response.ApiResponse;
import com.ev.customer_service.dto.response.ComplaintResponse;
import com.ev.customer_service.dto.response.ComplaintStatisticsResponse;
import com.ev.customer_service.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controller quản lý Phản hồi & Khiếu nại khách hàng
 * 
 * User Stories:
 * 1. Dealer Staff ghi nhận phản hồi của khách hàng
 * 2. Dealer Manager phân loại và gán người xử lý
 * 3. Dealer Staff cập nhật tiến độ xử lý
 * 4. Dealer Staff gửi kết quả xử lý cho khách hàng
 * 5. Dealer Manager xem và lọc danh sách phản hồi, xem thống kê
 */
@RestController
@RequestMapping("/customers/api/complaints")
@RequiredArgsConstructor
@Slf4j
public class ComplaintController {

    private final ComplaintService complaintService;

    /**
     * US1: Ghi nhận phản hồi mới
     * Dealer Staff tạo phản hồi từ khách hàng
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(
            @Valid @RequestBody CreateComplaintRequest request) {
        log.info("Creating new complaint for customer {}", request.getCustomerId());
        ComplaintResponse response = complaintService.createComplaint(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint created successfully", response));
    }

    /**
     * US2: Phân công xử lý phản hồi
     * Dealer Manager gán nhân viên và chuyển trạng thái
     */
    @PutMapping("/{id}/assign")
    @PreAuthorize("hasRole('DEALER_MANAGER')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> assignComplaint(
            @PathVariable Long id,
            @Valid @RequestBody AssignComplaintRequest request) {
        log.info("Assigning complaint {} to staff {}", id, request.getAssignedStaffId());
        ComplaintResponse response = complaintService.assignComplaint(id, request);
        return ResponseEntity.ok(ApiResponse.success("Complaint assigned successfully", response));
    }

    /**
     * US3: Cập nhật tiến độ xử lý
     * Dealer Staff (người được gán) thêm update note
     */
    @PostMapping("/{id}/progress")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> addProgressUpdate(
            @PathVariable Long id,
            @Valid @RequestBody ComplaintProgressUpdate update) {
        log.info("Adding progress update to complaint {}", id);
        ComplaintResponse response = complaintService.addProgressUpdate(id, update);
        return ResponseEntity.ok(ApiResponse.success("Progress updated successfully", response));
    }

    /**
     * US4: Đánh dấu phản hồi đã giải quyết và gửi thông báo
     * Dealer Staff hoàn tất xử lý
     */
    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> resolveComplaint(
            @PathVariable Long id,
            @Valid @RequestBody ResolveComplaintRequest request) {
        log.info("Resolving complaint {}", id);
        ComplaintResponse response = complaintService.resolveComplaint(id, request);
        return ResponseEntity.ok(ApiResponse.success("Complaint resolved successfully", response));
    }

    /**
     * Đóng phản hồi
     * Dealer Manager xác nhận đóng sau khi resolved
     */
    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('DEALER_MANAGER')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> closeComplaint(@PathVariable Long id) {
        log.info("Closing complaint {}", id);
        ComplaintResponse response = complaintService.closeComplaint(id);
        return ResponseEntity.ok(ApiResponse.success("Complaint closed successfully", response));
    }

    /**
     * Lấy chi tiết phản hồi
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintById(@PathVariable Long id) {
        ComplaintResponse response = complaintService.getComplaintById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Lấy danh sách phản hồi theo dealer
     */
    @GetMapping("/dealer/{dealerId}")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getComplaintsByDealer(
            @PathVariable Long dealerId) {
        List<ComplaintResponse> complaints = complaintService.getComplaintsByDealer(dealerId);
        return ResponseEntity.ok(ApiResponse.success(complaints));
    }

    /**
     * US5: Filter phản hồi theo nhiều tiêu chí
     * Dealer Manager xem và lọc danh sách
     */
    @PostMapping("/filter")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<ApiResponse<Page<ComplaintResponse>>> filterComplaints(
            @Valid @RequestBody ComplaintFilterRequest filter) {
        log.info("Filtering complaints with criteria: {}", filter);
        Page<ComplaintResponse> page = complaintService.filterComplaints(filter);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    /**
     * US5: Xem thống kê phản hồi
     * Dealer Manager xem dashboard
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('DEALER_MANAGER')")
    public ResponseEntity<ApiResponse<ComplaintStatisticsResponse>> getStatistics(
            @RequestParam Long dealerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        // Default date range: last 30 days
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        log.info("Getting complaint statistics for dealer {} from {} to {}", dealerId, startDate, endDate);
        ComplaintStatisticsResponse statistics = complaintService.getStatistics(dealerId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }

    /**
     * Gửi thông báo kết quả xử lý đến khách hàng
     * Dealer Staff có thể gửi thủ công
     */
    @PostMapping("/{id}/send-notification")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> sendNotificationToCustomer(
            @PathVariable Long id) {
        log.info("Sending notification to customer for complaint {}", id);
        ComplaintResponse response = complaintService.sendNotificationToCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Thông báo đã được gửi đến khách hàng", response));
    }
}
