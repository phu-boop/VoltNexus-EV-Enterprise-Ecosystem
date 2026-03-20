package com.ev.customer_service.service;

import com.ev.customer_service.dto.request.AssignStaffRequest;
import com.ev.customer_service.dto.response.AssignmentResponse;
import com.ev.customer_service.dto.response.StaffDTO;
import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.exception.ResourceNotFoundException;
import com.ev.customer_service.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service để quản lý phân công nhân viên cho khách hàng
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StaffAssignmentService {

    private final CustomerRepository customerRepository;

    /**
     * Phân công nhân viên cho khách hàng
     * 
     * @param customerId ID của khách hàng
     * @param request Request chứa staffId và note
     * @return AssignmentResponse
     */
    @Transactional
    public AssignmentResponse assignStaffToCustomer(Long customerId, AssignStaffRequest request) {
        log.info("Assigning staff {} to customer {}", request.getStaffId(), customerId);

        // 1. Kiểm tra customer tồn tại
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        // 2. Validate UUID format của staffId
        try {
            java.util.UUID.fromString(request.getStaffId());
        } catch (IllegalArgumentException e) {
            log.error("Invalid staff ID format: {}", request.getStaffId());
            throw new IllegalArgumentException(
                "Invalid staff ID format. Please select a valid staff member from the dropdown. " +
                "Received: '" + request.getStaffId() + "'. " +
                "Expected: UUID format (e.g., '123e4567-e89b-12d3-a456-426614174000')"
            );
        }

        // 3. LƯU GHI CHÚ: Không validate staff với User Service vì cần ADMIN role
        // Frontend đã validate khi chọn từ dropdown (chỉ ACTIVE staff)
        // Backend chỉ lưu UUID vào database
        
        // 4. Cập nhật phân công
        customer.setAssignedStaffId(request.getStaffId());
        Customer updatedCustomer = customerRepository.save(customer);

        log.info("Successfully assigned staff {} to customer {}", request.getStaffId(), customerId);

        // 5. Gửi thông báo cho nhân viên mới được phân công (tùy chọn)
        // NOTE: Bỏ qua notification vì không có thông tin staff (cần ADMIN role)
        // Notification có thể được gửi từ frontend sau khi assign thành công

        // 6. Tạo response
        String customerFullName = customer.getFirstName() + " " + customer.getLastName();
        AssignmentResponse response = new AssignmentResponse();
        response.setCustomerId(updatedCustomer.getCustomerId());
        response.setCustomerCode(updatedCustomer.getCustomerCode());
        response.setCustomerName(customerFullName);
        response.setAssignedStaffId(request.getStaffId());
        response.setAssignedStaffName(null); // Frontend sẽ tự lấy tên từ staffId
        response.setAssignedAt(LocalDateTime.now());
        response.setMessage("Staff assigned successfully");

        return response;
    }

    /**
     * Hủy phân công nhân viên cho khách hàng
     * 
     * @param customerId ID của khách hàng
     * @return AssignmentResponse
     */
    @Transactional
    public AssignmentResponse unassignStaffFromCustomer(Long customerId) {
        log.info("Unassigning staff from customer {}", customerId);

        // 1. Kiểm tra customer tồn tại
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        // 2. Kiểm tra xem customer có được phân công nhân viên không
        if (customer.getAssignedStaffId() == null) {
            throw new IllegalStateException("Customer is not assigned to any staff");
        }

        // 3. Hủy phân công
        customer.setAssignedStaffId(null);
        Customer updatedCustomer = customerRepository.save(customer);

        log.info("Successfully unassigned staff from customer {}", customerId);

        // 4. Tạo response
        String customerFullName = customer.getFirstName() + " " + customer.getLastName();
        AssignmentResponse response = new AssignmentResponse();
        response.setCustomerId(updatedCustomer.getCustomerId());
        response.setCustomerCode(updatedCustomer.getCustomerCode());
        response.setCustomerName(customerFullName);
        response.setAssignedStaffId(null);
        response.setAssignedStaffName(null);
        response.setAssignedAt(LocalDateTime.now());
        response.setMessage("Staff unassigned successfully");

        return response;
    }

    /**
     * Lấy thông tin nhân viên được phân công cho khách hàng
     * CHÚ Ý: Chỉ trả về assignedStaffId (UUID), frontend tự lấy thông tin staff từ User Service
     * 
     * @param customerId ID của khách hàng
     * @return StaffDTO với chỉ ID, hoặc null nếu chưa được phân công
     */
    @Transactional(readOnly = true)
    public StaffDTO getAssignedStaff(Long customerId) {
        log.info("Getting assigned staff ID for customer {}", customerId);

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        if (customer.getAssignedStaffId() == null) {
            return null;
        }

        // Chỉ trả về staffId, frontend sẽ gọi User Service để lấy thông tin chi tiết
        StaffDTO staffInfo = new StaffDTO();
        staffInfo.setId(customer.getAssignedStaffId());
        return staffInfo;
    }

}
