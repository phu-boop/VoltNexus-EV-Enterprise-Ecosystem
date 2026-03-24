package com.ev.customer_service.service;

import com.ev.customer_service.dto.request.CustomerRequest;
import com.ev.customer_service.dto.response.CustomerResponse;
import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.entity.CustomerProfileAudit;
import com.ev.customer_service.enums.CustomerStatus;
import com.ev.customer_service.enums.CustomerType;
import com.ev.customer_service.exception.DuplicateResourceException;
import com.ev.customer_service.exception.ResourceNotFoundException;
import com.ev.customer_service.repository.CustomerProfileAuditRepository;
import com.ev.customer_service.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ModelMapper modelMapper;

    @Mock
    private CustomerProfileAuditRepository auditRepository;

    @InjectMocks
    private CustomerService customerService;

    private Customer customer;
    private CustomerRequest customerRequest;
    private CustomerResponse customerResponse;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setCustomerId(1L);
        customer.setEmail("john@example.com");
        customer.setPhone("0912345678");
        customer.setIdNumber("123456789");
        customer.setFirstName("John");
        customer.setLastName("Doe");
        customer.setCustomerType(CustomerType.INDIVIDUAL);
        customer.setStatus(CustomerStatus.NEW);

        customerRequest = new CustomerRequest();
        customerRequest.setEmail("john@example.com");
        customerRequest.setPhone("0912345678");
        customerRequest.setIdNumber("123456789");
        customerRequest.setFirstName("John");
        customerRequest.setLastName("Doe");
        customerRequest.setCustomerType("INDIVIDUAL");

        customerResponse = new CustomerResponse();
        customerResponse.setCustomerId(1L);
        customerResponse.setEmail("john@example.com");
    }

    @Nested
    @DisplayName("Tạo mới khách hàng")
    class CreateCustomer {
        @Test
        @DisplayName("Tạo thành công")
        void createCustomer_success() {
            when(customerRepository.existsByEmail(anyString())).thenReturn(false);
            when(customerRepository.existsByPhone(anyString())).thenReturn(false);
            when(customerRepository.existsByIdNumber(anyString())).thenReturn(false);
            when(modelMapper.map(any(CustomerRequest.class), eq(Customer.class))).thenReturn(customer);
            when(customerRepository.save(any(Customer.class))).thenReturn(customer);
            when(modelMapper.map(any(Customer.class), eq(CustomerResponse.class))).thenReturn(customerResponse);

            CustomerResponse result = customerService.createCustomer(customerRequest);

            assertThat(result).isNotNull();
            verify(customerRepository).save(customer);
        }

        @Test
        @DisplayName("Email đã tồn tại → ném DuplicateResourceException")
        void createCustomer_emailExists() {
            when(customerRepository.existsByEmail(anyString())).thenReturn(true);

            assertThatThrownBy(() -> customerService.createCustomer(customerRequest))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessageContaining("email");
        }
    }

    @Nested
    @DisplayName("Cập nhật khách hàng & Audit trail")
    class UpdateCustomer {
        @Test
        @DisplayName("Cập nhật thành công với audit trail")
        void updateCustomer_success_withAudit() {
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            when(customerRepository.save(any(Customer.class))).thenReturn(customer);
            when(modelMapper.map(any(Customer.class), eq(CustomerResponse.class))).thenReturn(customerResponse);

            customerRequest.setFirstName("John Updated");
            customerRequest.setCustomerType("CORPORATE");

            CustomerResponse result = customerService.updateCustomer(1L, customerRequest);

            assertThat(result).isNotNull();
            verify(auditRepository).save(any(CustomerProfileAudit.class));
            assertThat(customer.getFirstName()).isEqualTo("John Updated");
        }

        @Test
        @DisplayName("Cập nhật email trùng khách hàng khác → ném DuplicateResourceException")
        void updateCustomer_emailConflict() {
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            customerRequest.setEmail("other@example.com");
            when(customerRepository.existsByEmail("other@example.com")).thenReturn(true);

            assertThatThrownBy(() -> customerService.updateCustomer(1L, customerRequest))
                    .isInstanceOf(DuplicateResourceException.class);
        }

        @Test
        @DisplayName("Cập nhật phone trùng khách hàng khác → ném DuplicateResourceException")
        void updateCustomer_phoneConflict() {
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            customerRequest.setPhone("0999999999");
            when(customerRepository.existsByPhone("0999999999")).thenReturn(true);

            assertThatThrownBy(() -> customerService.updateCustomer(1L, customerRequest))
                    .isInstanceOf(DuplicateResourceException.class);
        }

        @Test
        @DisplayName("Cập nhật ID number trùng khách hàng khác → ném DuplicateResourceException")
        void updateCustomer_idNumberConflict() {
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            customerRequest.setIdNumber("999999999");
            when(customerRepository.existsByIdNumber("999999999")).thenReturn(true);

            assertThatThrownBy(() -> customerService.updateCustomer(1L, customerRequest))
                    .isInstanceOf(DuplicateResourceException.class);
        }

        @Test
        @DisplayName("Cập nhật với enum không hợp lệ → dùng giá trị mặc định/giữ nguyên")
        void updateCustomer_invalidEnums() {
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            when(customerRepository.save(any(Customer.class))).thenReturn(customer);
            when(modelMapper.map(any(Customer.class), eq(CustomerResponse.class))).thenReturn(customerResponse);

            customerRequest.setCustomerType("INVALID_TYPE");
            customerRequest.setStatus("INVALID_STATUS");

            customerService.updateCustomer(1L, customerRequest);

            assertThat(customer.getCustomerType()).isEqualTo(CustomerType.INDIVIDUAL);
            assertThat(customer.getStatus()).isEqualTo(CustomerStatus.NEW);
        }
    }

    @Nested
    @DisplayName("Tìm kiếm & Xóa")
    class SearchAndDelete {
        @Test
        @DisplayName("Xóa thành công")
        void deleteCustomer_success() {
            when(customerRepository.existsById(1L)).thenReturn(true);

            customerService.deleteCustomer(1L);

            verify(customerRepository).deleteById(1L);
        }

        @Test
        @DisplayName("Lấy lịch sử audit thành công")
        void getCustomerAuditHistory_success() {
            when(customerRepository.existsById(1L)).thenReturn(true);
            when(auditRepository.findByCustomerIdOrderByChangedAtDesc(1L))
                    .thenReturn(java.util.List.of(new com.ev.customer_service.entity.CustomerProfileAudit()));

            java.util.List<com.ev.customer_service.dto.response.AuditResponse> results = customerService
                    .getCustomerAuditHistory(1L);

            assertThat(results).isNotNull();
        }

        @Test
        @DisplayName("Tìm kiếm khách hàng thành công")
        void searchCustomers_success() {
            when(customerRepository.searchCustomers("John")).thenReturn(java.util.List.of(customer));
            when(modelMapper.map(any(Customer.class), eq(CustomerResponse.class))).thenReturn(customerResponse);

            java.util.List<CustomerResponse> results = customerService.searchCustomers("John");

            assertThat(results).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Lấy danh sách khách hàng")
    class GetCustomers {
        @Test
        @DisplayName("Lấy tất cả khách hàng")
        void getAllCustomers_success() {
            when(customerRepository.findAll()).thenReturn(java.util.List.of(customer));
            when(modelMapper.map(any(Customer.class), eq(CustomerResponse.class))).thenReturn(customerResponse);

            java.util.List<CustomerResponse> results = customerService.getAllCustomers();

            assertThat(results).hasSize(1);
        }

        @Test
        @DisplayName("Lấy theo Profile ID")
        void getCustomerByProfileId_success() {
            when(customerRepository.findByProfileId("PROF-1")).thenReturn(Optional.of(customer));
            when(modelMapper.map(any(Customer.class), eq(CustomerResponse.class))).thenReturn(customerResponse);

            CustomerResponse result = customerService.getCustomerByProfileId("PROF-1");

            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("Lấy theo ID thành công")
        void getCustomerById_success() {
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            when(modelMapper.map(any(Customer.class), eq(CustomerResponse.class))).thenReturn(customerResponse);

            CustomerResponse result = customerService.getCustomerById(1L);

            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("Lấy theo ID không tồn tại → ném ResourceNotFoundException")
        void getCustomerById_notFound() {
            when(customerRepository.findById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> customerService.getCustomerById(1L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
