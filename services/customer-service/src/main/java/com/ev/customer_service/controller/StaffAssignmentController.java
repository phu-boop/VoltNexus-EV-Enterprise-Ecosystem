package com.ev.customer_service.controller;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.customer_service.dto.request.AssignStaffRequest;
import com.ev.customer_service.dto.response.AssignmentResponse;
import com.ev.customer_service.dto.response.StaffDTO;
import com.ev.customer_service.service.StaffAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller để quản lý phân công nhân viên cho khách hàng
 */
@Slf4j
@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class StaffAssignmentController {

    private final StaffAssignmentService staffAssignmentService;

    /**
     * Phân công nhân viên cho khách hàng
     * POST /customers/{customerId}/assign-staff
     * 
     * Request body:
     * {
     *   "staffId": 123,
     *   "note": "Optional note"
     * }
     */
    @PostMapping("/{customerId}/assign-staff")
    public ResponseEntity<ApiRespond<AssignmentResponse>> assignStaff(
            @PathVariable Long customerId,
            @Valid @RequestBody AssignStaffRequest request) {
        
        log.info("POST /customers/{}/assign-staff - Assigning staff {}", customerId, request.getStaffId());
        
        try {
            AssignmentResponse response = staffAssignmentService.assignStaffToCustomer(customerId, request);
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(ApiRespond.success("Staff assigned to customer successfully", response));
        } catch (Exception e) {
            log.error("Error assigning staff to customer: ", e);
            throw e;
        }
    }

    /**
     * Hủy phân công nhân viên cho khách hàng
     * DELETE /customers/{customerId}/assign-staff
     */
    @DeleteMapping("/{customerId}/assign-staff")
    public ResponseEntity<ApiRespond<AssignmentResponse>> unassignStaff(@PathVariable Long customerId) {
        
        log.info("DELETE /customers/{}/assign-staff - Unassigning staff", customerId);
        
        try {
            AssignmentResponse response = staffAssignmentService.unassignStaffFromCustomer(customerId);
            return ResponseEntity.ok(ApiRespond.success("Staff unassigned from customer successfully", response));
        } catch (Exception e) {
            log.error("Error unassigning staff from customer: ", e);
            throw e;
        }
    }

    /**
     * Lấy thông tin nhân viên được phân công cho khách hàng
     * GET /customers/{customerId}/assigned-staff
     */
    @GetMapping("/{customerId}/assigned-staff")
    public ResponseEntity<ApiRespond<StaffDTO>> getAssignedStaff(@PathVariable Long customerId) {
        
        log.info("GET /customers/{}/assigned-staff - Getting assigned staff info", customerId);
        
        try {
            StaffDTO staff = staffAssignmentService.getAssignedStaff(customerId);
            
            if (staff == null) {
                return ResponseEntity.ok(ApiRespond.success("No staff assigned to this customer", null));
            }
            
            return ResponseEntity.ok(ApiRespond.success("Assigned staff retrieved successfully", staff));
        } catch (Exception e) {
            log.error("Error getting assigned staff: ", e);
            throw e;
        }
    }

}
