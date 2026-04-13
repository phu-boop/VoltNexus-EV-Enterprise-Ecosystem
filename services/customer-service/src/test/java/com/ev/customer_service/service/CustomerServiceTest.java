package com.ev.customer_service.service;

import com.ev.customer_service.dto.request.CustomerRequest;
import com.ev.customer_service.dto.response.AuditResponse;
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
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CustomerProfileAuditRepository auditRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Spy
    private ModelMapper modelMapper = new ModelMapper();

    @InjectMocks
    private CustomerService customerService;

    private Customer customer;
    private CustomerRequest customerRequest;

    @BeforeEach
    void setUp() {
        // Configure ModelMapper to match AppConfig (STRICT strategy)
        modelMapper.getConfiguration().setMatchingStrategy(MatchingStrategies.STRICT);

        customer = new Customer();
        customer.setCustomerId(1L);
        customer.setFirstName("John");
        customer.setLastName("Doe");
        customer.setEmail("john.doe@example.com");
        customer.setPhone("0987654321");
        customer.setIdNumber("ID123");
        customer.setCustomerType(CustomerType.INDIVIDUAL);
        customer.setStatus(CustomerStatus.NEW);

        customerRequest = new CustomerRequest();
        customerRequest.setFirstName("John");
        customerRequest.setLastName("Doe");
        customerRequest.setEmail("john.doe@example.com");
        customerRequest.setPhone("0987654321");
        customerRequest.setIdNumber("ID123");
        customerRequest.setCustomerType("INDIVIDUAL");
        customerRequest.setStatus("NEW");
    }

    @Nested
    @DisplayName("createCustomer()")
    class CreateCustomer {
        @Test
        @DisplayName("Tạo customer thành công")
        void createCustomer_success() {
            when(customerRepository.existsByEmail(anyString())).thenReturn(false);
            when(customerRepository.existsByPhone(anyString())).thenReturn(false);
            when(customerRepository.existsByIdNumber(anyString())).thenReturn(false);
            when(customerRepository.count()).thenReturn(100L);
            when(customerRepository.save(any(Customer.class))).thenReturn(customer);

            CustomerResponse result = customerService.createCustomer(customerRequest, "ADMIN", null);

            assertThat(result).isNotNull();
            verify(customerRepository).save(any(Customer.class));
        }

        @Test
        @DisplayName("Email đã tồn tại -> ném DuplicateResourceException")
        void createCustomer_duplicateEmail() {
            when(customerRepository.existsByEmail(anyString())).thenReturn(true);
            assertThatThrownBy(() -> customerService.createCustomer(customerRequest, "ADMIN", null))
                    .isInstanceOf(DuplicateResourceException.class);
        }

        @Test
        @DisplayName("Type không hợp lệ -> gán INDIVIDUAL mặc định")
        void createCustomer_invalidType_defaults() {
            customerRequest.setCustomerType("INVALID");
            when(customerRepository.save(any(Customer.class))).thenAnswer(args -> args.getArgument(0));

            customerService.createCustomer(customerRequest, "ADMIN", null);

            verify(customerRepository).save(argThat(c -> c.getCustomerType() == CustomerType.INDIVIDUAL));
        }
    }

    @Nested
    @DisplayName("updateCustomer()")
    class UpdateCustomer {
        @Test
        @DisplayName("Cập nhật thành công kèm ghi audit log")
        void updateCustomer_success_withAudit() {
            customerRequest.setFirstName("Johnny");
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            when(customerRepository.save(any(Customer.class))).thenAnswer(args -> args.getArgument(0));

            customerService.updateCustomer(1L, customerRequest, "ADMIN", null);

            verify(auditRepository).save(any(CustomerProfileAudit.class));
            verify(customerRepository).save(argThat(c -> c.getFirstName().equals("Johnny")));
        }

        @Test
        @DisplayName("Cập nhật email trùng của người khác -> ném DuplicateResourceException")
        void updateCustomer_duplicateEmail() {
            customerRequest.setEmail("other@test.com");
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            when(customerRepository.existsByEmail("other@test.com")).thenReturn(true);

            assertThatThrownBy(() -> customerService.updateCustomer(1L, customerRequest, "ADMIN", null))
                    .isInstanceOf(DuplicateResourceException.class);
        }
    }

    @Nested
    @DisplayName("Audit History")
    class AuditHistory {
        @Test
        @DisplayName("Lấy lịch sử audit thành công")
        void getAuditHistory_success() {
            CustomerProfileAudit audit = new CustomerProfileAudit();
            audit.setCustomerId(1L);
            audit.setChangedAt(LocalDateTime.now());
            audit.setChangesJson("{}");

            when(customerRepository.existsById(1L)).thenReturn(true);
            when(auditRepository.findByCustomerIdOrderByChangedAtDesc(1L)).thenReturn(List.of(audit));

            List<AuditResponse> result = customerService.getCustomerAuditHistory(1L);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Lấy audit cho customer không tồn tại -> ném ResourceNotFoundException")
        void getAuditHistory_notFound() {
            when(customerRepository.existsById(99L)).thenReturn(false);
            assertThatThrownBy(() -> customerService.getCustomerAuditHistory(99L))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Test
    @DisplayName("Xóa customer thành công")
    void deleteCustomer_success() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        customerService.deleteCustomer(1L, "ADMIN", null);
        verify(customerRepository).deleteById(1L);
        verify(kafkaTemplate).send("customer.deleted", "1");
    }

    @Test
    @DisplayName("Tìm kiếm customer thành công")
    void searchCustomers_success() {
        when(customerRepository.searchCustomersByDealer("John", null)).thenReturn(List.of(customer));
        List<CustomerResponse> result = customerService.searchCustomers("John");
        assertThat(result).hasSize(1);
    }

    @Test
    @DisplayName("Lấy customer theo đại lý thành công")
    void getCustomersByDealer_success() {
        UUID dealerId = UUID.randomUUID();
        when(customerRepository.findByPreferredDealerId(dealerId)).thenReturn(List.of(customer));

        List<CustomerResponse> result = customerService.getCustomersByDealer(null, dealerId.toString());

        assertThat(result).hasSize(1);
        verify(customerRepository).findByPreferredDealerId(dealerId);
    }

    @Test
    @DisplayName("Lấy customer phân trang mặc định thành công")
    void getCustomersWithPagination_success() {
        Page<Customer> customerPage = new PageImpl<>(List.of(customer), PageRequest.of(0, 20), 1);
        when(customerRepository.findAll(any(PageRequest.class))).thenReturn(customerPage);

        Page<CustomerResponse> result = customerService.getCustomersWithPagination(null, 0, 20);

        assertThat(result.getContent()).hasSize(1);
        verify(customerRepository).findAll(any(PageRequest.class));
    }

    @Test
    @DisplayName("Page size vượt quá giới hạn -> ném IllegalArgumentException")
    void getCustomersWithPagination_exceedMaxSize() {
        assertThatThrownBy(() -> customerService.getCustomersWithPagination(null, 0, 1000))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Page size exceeds maximum limit of 100");
    }

    @Test
    @DisplayName("Tạo customer theo đại lý thành công")
    void createCustomerForDealer_success() {
        UUID dealerId = UUID.randomUUID();
        when(customerRepository.existsByEmail(anyString())).thenReturn(false);
        when(customerRepository.existsByPhone(anyString())).thenReturn(false);
        when(customerRepository.existsByIdNumber(anyString())).thenReturn(false);
        when(customerRepository.count()).thenReturn(100L);
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CustomerResponse result = customerService.createCustomerForDealer(customerRequest, dealerId.toString());

        assertThat(result).isNotNull();
        verify(customerRepository).save(argThat(c -> dealerId.equals(c.getPreferredDealerId())));
    }

    @Test
    @DisplayName("Tạo customer theo đại lý thiếu dealerId -> ném IllegalArgumentException")
    void createCustomerForDealer_missingDealerId() {
        assertThatThrownBy(() -> customerService.createCustomerForDealer(customerRequest, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Dealer ID is required for dealer customer creation");
    }
}
