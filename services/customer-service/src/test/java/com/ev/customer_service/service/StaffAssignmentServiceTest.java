package com.ev.customer_service.service;

import com.ev.customer_service.dto.request.AssignStaffRequest;
import com.ev.customer_service.dto.response.AssignmentResponse;
import com.ev.customer_service.dto.response.StaffDTO;
import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.exception.ResourceNotFoundException;
import com.ev.customer_service.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StaffAssignmentServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private StaffAssignmentService staffAssignmentService;

    private Customer customer;
    private String validStaffId;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setCustomerId(1L);
        customer.setCustomerCode("CUS-001");
        customer.setFirstName("John");
        customer.setLastName("Doe");

        validStaffId = UUID.randomUUID().toString();
    }

    @Test
    @DisplayName("Phân công nhân viên thành công")
    void assignStaffToCustomer_success() {
        AssignStaffRequest request = new AssignStaffRequest();
        request.setStaffId(validStaffId);

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(customerRepository.save(any(Customer.class))).thenReturn(customer);

        AssignmentResponse response = staffAssignmentService.assignStaffToCustomer(1L, request);

        assertThat(response).isNotNull();
        assertThat(response.getAssignedStaffId()).isEqualTo(validStaffId);
        assertThat(customer.getAssignedStaffId()).isEqualTo(validStaffId);
        verify(customerRepository).save(customer);
    }

    @Test
    @DisplayName("Phân công với staffId sai định dạng UUID → ném IllegalArgumentException")
    void assignStaffToCustomer_invalidUuid() {
        AssignStaffRequest request = new AssignStaffRequest();
        request.setStaffId("invalid-uuid");

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));

        assertThatThrownBy(() -> staffAssignmentService.assignStaffToCustomer(1L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid staff ID format");
    }

    @Test
    @DisplayName("Hủy phân công nhân viên thành công")
    void unassignStaffFromCustomer_success() {
        customer.setAssignedStaffId(validStaffId);
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(customerRepository.save(any(Customer.class))).thenReturn(customer);

        AssignmentResponse response = staffAssignmentService.unassignStaffFromCustomer(1L);

        assertThat(response).isNotNull();
        assertThat(customer.getAssignedStaffId()).isNull();
        verify(customerRepository).save(customer);
    }

    @Test
    @DisplayName("Hủy phân công khi chưa được gán → ném IllegalStateException")
    void unassignStaffFromCustomer_notAssigned() {
        customer.setAssignedStaffId(null);
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));

        assertThatThrownBy(() -> staffAssignmentService.unassignStaffFromCustomer(1L))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("Lấy thông tin nhân viên được gán")
    void getAssignedStaff_success() {
        customer.setAssignedStaffId(validStaffId);
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));

        StaffDTO response = staffAssignmentService.getAssignedStaff(1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(validStaffId);
    }

    @Test
    @DisplayName("Lấy thông tin khi chưa gán → trả về null")
    void getAssignedStaff_notAssigned() {
        customer.setAssignedStaffId(null);
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));

        StaffDTO response = staffAssignmentService.getAssignedStaff(1L);

        assertThat(response).isNull();
    }
}
