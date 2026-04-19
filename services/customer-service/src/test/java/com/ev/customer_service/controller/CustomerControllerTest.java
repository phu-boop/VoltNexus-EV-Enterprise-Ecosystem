package com.ev.customer_service.controller;

import com.ev.customer_service.dto.request.CustomerRequest;
import com.ev.customer_service.dto.response.CustomerResponse;
import com.ev.customer_service.enums.CustomerStatus;
import com.ev.customer_service.enums.CustomerType;
import com.ev.customer_service.service.CustomerService;
import com.ev.customer_service.dto.response.AuditResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.UUID;
import org.springframework.security.test.context.support.WithMockUser;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CustomerController.class)
@WithMockUser(roles = "ADMIN")
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CustomerService customerService;

    @Autowired
    private ObjectMapper objectMapper;

    private CustomerResponse customerResponse;
    private CustomerRequest customerRequest;

    @BeforeEach
    void setUp() {
        customerResponse = new CustomerResponse();
        customerResponse.setCustomerId(1L);
        customerResponse.setCustomerCode("CUS-001");
        customerResponse.setFirstName("John");
        customerResponse.setLastName("Doe");
        customerResponse.setEmail("john@example.com");
        customerResponse.setPhone("1234567890");
        customerResponse.setCustomerType(CustomerType.INDIVIDUAL.name());
        customerResponse.setStatus(CustomerStatus.NEW.name());

        customerRequest = new CustomerRequest();
        customerRequest.setFirstName("John");
        customerRequest.setLastName("Doe");
        customerRequest.setEmail("john@example.com");
        customerRequest.setPhone("1234567890");
    }

    @Test
    @DisplayName("Health check")
    void health() throws Exception {
        mockMvc.perform(get("/customers/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("Customer Service is running!"));
    }

    @Test
    @DisplayName("Get all customers - no search")
    void getAllCustomers() throws Exception {
        when(customerService.getCustomersWithFilter(any(), any(), any())).thenReturn(Arrays.asList(customerResponse));

        mockMvc.perform(get("/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.message").value("Customers retrieved successfully"))
                .andExpect(jsonPath("$.data[0].email").value("john@example.com"));
    }

    @Test
    @DisplayName("Get all customers - with search")
    void searchCustomers() throws Exception {
        when(customerService.getCustomersWithFilter(eq("John"), any(), any())).thenReturn(Arrays.asList(customerResponse));

        mockMvc.perform(get("/customers").param("search", "John"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.data[0].firstName").value("John"));
    }

    @Test
    @WithMockUser(roles = "DEALER_MANAGER")
    @DisplayName("Get customers by dealer")
    void getCustomersByDealer() throws Exception {
        when(customerService.getCustomersByDealer(eq("John"), any())).thenReturn(Arrays.asList(customerResponse));

        mockMvc.perform(get("/customers/dealer")
                .param("search", "John")
                .header("X-User-DealerId", UUID.randomUUID().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.message").value("Dealer customers retrieved successfully"))
                .andExpect(jsonPath("$.data[0].email").value("john@example.com"));
    }

            @Test
            @WithMockUser(roles = "DEALER_MANAGER")
            @DisplayName("Get customers paged - default pagination")
            void getCustomersPaged_default() throws Exception {
            Page<CustomerResponse> paged = new PageImpl<>(Arrays.asList(customerResponse));
            when(customerService.getCustomersWithPagination(any(), eq(0), eq(20))).thenReturn(paged);

            mockMvc.perform(get("/customers/paged"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.message").value("Customers retrieved"))
                .andExpect(jsonPath("$.data.content[0].email").value("john@example.com"));
            }

            @Test
            @WithMockUser(roles = "DEALER_STAFF")
            @DisplayName("Get customers paged - max valid size 100")
            void getCustomersPaged_maxValidSize() throws Exception {
            Page<CustomerResponse> paged = new PageImpl<>(Arrays.asList(customerResponse));
            when(customerService.getCustomersWithPagination(any(), eq(0), eq(100))).thenReturn(paged);

            mockMvc.perform(get("/customers/paged").param("size", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Customers retrieved"));
            }

            @Test
            @WithMockUser(roles = "DEALER_MANAGER")
            @DisplayName("Get customers paged - invalid size exceeds max")
            void getCustomersPaged_invalidSize() throws Exception {
            when(customerService.getCustomersWithPagination(any(), anyInt(), eq(1000)))
                .thenThrow(new IllegalArgumentException("Page size exceeds maximum limit of 100"));

            mockMvc.perform(get("/customers/paged").param("size", "1000"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Page size exceeds maximum limit of 100"));
            }

    @Test
    @DisplayName("Get customer by ID")
    void getCustomerById() throws Exception {
        Mockito.when(customerService.getCustomerById(1L)).thenReturn(customerResponse);

        mockMvc.perform(get("/customers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.data.customerId").value(1));
    }

    @Test
    @DisplayName("Get customer by Profile ID")
    void getCustomerByProfileId() throws Exception {
        Mockito.when(customerService.getCustomerByProfileId("prof-1")).thenReturn(customerResponse);

        mockMvc.perform(get("/customers/profile/prof-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.data.firstName").value("John"));
    }

    @Test
    @DisplayName("Create customer")
    void createCustomer() throws Exception {
        when(customerService.createCustomer(any(CustomerRequest.class), any(), any())).thenReturn(customerResponse);

        mockMvc.perform(post("/customers")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(customerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.data.email").value("john@example.com"));
    }

    @Test
    @WithMockUser(roles = "DEALER_MANAGER")
    @DisplayName("Create dealer customer")
    void createCustomerForDealer() throws Exception {
        when(customerService.createCustomerForDealer(any(CustomerRequest.class), any())).thenReturn(customerResponse);

        mockMvc.perform(post("/customers/dealer")
                .with(csrf())
                .header("X-User-DealerId", UUID.randomUUID().toString())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(customerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.message").value("Dealer customer created successfully"))
                .andExpect(jsonPath("$.data.email").value("john@example.com"));
    }

    @Test
    @DisplayName("Update customer")
    void updateCustomer() throws Exception {
        when(customerService.updateCustomer(anyLong(), any(CustomerRequest.class), any(), any()))
.thenReturn(customerResponse);

        mockMvc.perform(put("/customers/1")
                .with(csrf())
                .header("X-Modified-By", "user-1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(customerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.data.firstName").value("John"));
    }

    @Test
    @DisplayName("Delete customer")
    void deleteCustomer() throws Exception {
        doNothing().when(customerService).deleteCustomer(anyLong(), any(), any());

        mockMvc.perform(delete("/customers/1")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.message").value("Customer deleted successfully"));
    }

    @Test
    @DisplayName("Get customer statuses")
    void getCustomerStatuses() throws Exception {
        mockMvc.perform(get("/customers/enums/statuses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].value").exists());
    }

    @Test
    @DisplayName("Get customer types")
    void getCustomerTypes() throws Exception {
        mockMvc.perform(get("/customers/enums/types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].value").exists());
    }

    @Test
    @DisplayName("Get customer audit history")
    void getCustomerAuditHistory() throws Exception {
        AuditResponse audit = new AuditResponse();
        audit.setAuditId(1L);
        audit.setChangedBy("user-1");

        Mockito.when(customerService.getCustomerAuditHistory(1L)).thenReturn(Arrays.asList(audit));

        mockMvc.perform(get("/customers/1/audit-history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.data[0].changedBy").value("user-1"));
    }
}
