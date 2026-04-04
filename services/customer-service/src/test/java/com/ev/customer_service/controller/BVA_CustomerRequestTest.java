package com.ev.customer_service.controller;

import com.ev.customer_service.dto.request.CustomerRequest;
import com.ev.customer_service.dto.response.CustomerResponse;
import com.ev.customer_service.service.CustomerService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CustomerController.class)
@AutoConfigureMockMvc(addFilters = false) // Bypass spring security
public class BVA_CustomerRequestTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CustomerService customerService;

    private CustomerRequest baseRequest;

    @BeforeEach
    void setUp() {
        baseRequest = new CustomerRequest();
        baseRequest.setFirstName("John");
        baseRequest.setLastName("Doe");
        baseRequest.setEmail("valid@test.com");
        
        when(customerService.createCustomer(any(), any(), any())).thenReturn(new CustomerResponse());
    }

    private String createString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append('a');
        }
        return sb.toString();
    }
    
    private String createEmail(int length) {
        StringBuilder sb = new StringBuilder();
        int localLen = Math.min(60, length - 5);
        for(int i = 0; i < localLen; i++) sb.append('a');
        sb.append('@');
        int remaining = length - localLen - 1;
        
        while(remaining > 10) {
            for(int i = 0; i < 9; i++) sb.append('b');
            sb.append('.');
            remaining -= 10;
        }
        if (remaining >= 4) {
            for(int i=0; i<remaining-4; i++) sb.append('c');
            sb.append(".com");
        } else {
            for(int i=0; i<remaining; i++) sb.append('c');
        }
        return sb.toString();
    }

    // --- firstName (@Size(max = 100)) ---
    @Test
    void testFirstName_Length_99_ReturnsCreated() throws Exception {
        baseRequest.setFirstName(createString(99));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void testFirstName_Length_100_ReturnsCreated() throws Exception {
        baseRequest.setFirstName(createString(100));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void testFirstName_Length_101_ReturnsBadRequest() throws Exception {
        baseRequest.setFirstName(createString(101));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isBadRequest());
    }

    // --- lastName (@Size(max = 100)) ---
    @Test
    void testLastName_Length_99_ReturnsCreated() throws Exception {
        baseRequest.setLastName(createString(99));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void testLastName_Length_100_ReturnsCreated() throws Exception {
        baseRequest.setLastName(createString(100));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void testLastName_Length_101_ReturnsBadRequest() throws Exception {
        baseRequest.setLastName(createString(101));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isBadRequest());
    }

    // --- email (@Size(max = 100)) ---
    @Test
    void testEmail_Length_99_ReturnsCreated() throws Exception {
        baseRequest.setEmail(createEmail(99));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void testEmail_Length_100_ReturnsCreated() throws Exception {
        baseRequest.setEmail(createEmail(100));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void testEmail_Length_101_ReturnsBadRequest() throws Exception {
        baseRequest.setEmail(createEmail(101));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isBadRequest());
    }

    // --- phone (@Size(max = 20)) ---
    @Test
    void testPhone_Length_19_ReturnsCreated() throws Exception {
        baseRequest.setPhone(createString(19));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void testPhone_Length_20_ReturnsCreated() throws Exception {
        baseRequest.setPhone(createString(20));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void testPhone_Length_21_ReturnsBadRequest() throws Exception {
        baseRequest.setPhone(createString(21));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isBadRequest());
    }

    // --- address (@Size(max = 500)) ---
    @Test
    void testAddress_Length_499_ReturnsCreated() throws Exception {
        baseRequest.setAddress(createString(499));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void testAddress_Length_500_ReturnsCreated() throws Exception {
        baseRequest.setAddress(createString(500));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void testAddress_Length_501_ReturnsBadRequest() throws Exception {
        baseRequest.setAddress(createString(501));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isBadRequest());
    }

    // --- idNumber (@Size(max = 50)) ---
    @Test
    void testIdNumber_Length_49_ReturnsCreated() throws Exception {
        baseRequest.setIdNumber(createString(49));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void testIdNumber_Length_50_ReturnsCreated() throws Exception {
        baseRequest.setIdNumber(createString(50));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void testIdNumber_Length_51_ReturnsBadRequest() throws Exception {
        baseRequest.setIdNumber(createString(51));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isBadRequest());
    }

    // --- profileId (@Size(max = 36)) ---
    @Test
    void testProfileId_Length_35_ReturnsCreated() throws Exception {
        baseRequest.setProfileId(createString(35));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void testProfileId_Length_36_ReturnsCreated() throws Exception {
        baseRequest.setProfileId(createString(36));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void testProfileId_Length_37_ReturnsBadRequest() throws Exception {
        baseRequest.setProfileId(createString(37));
        mockMvc.perform(post("/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(baseRequest)))
                .andExpect(status().isBadRequest());
    }
}
