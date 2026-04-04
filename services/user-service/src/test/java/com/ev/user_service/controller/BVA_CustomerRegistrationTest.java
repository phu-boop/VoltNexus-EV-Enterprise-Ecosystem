package com.ev.user_service.controller;

import com.ev.user_service.dto.request.CustomerRegistrationRequest;
import com.ev.user_service.dto.respond.UserRespond;
import com.ev.user_service.service.AuthService;
import com.ev.user_service.service.LoginAttemptService;
import com.ev.user_service.service.RecaptchaService;
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

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false) // Bypass spring security validations
public class BVA_CustomerRegistrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private RecaptchaService recaptchaService;

    @MockBean
    private LoginAttemptService loginAttemptService;

    private CustomerRegistrationRequest request;

    @BeforeEach
    void setUp() {
        request = new CustomerRegistrationRequest();
        request.setEmail("valid.email@example.com");
        request.setName("John Doe");
        // password to be explicitly tested
    }

    @Test
    void testPasswordLength_Boundary_7_ReturnsBadRequest() throws Exception {
        request.setPassword("1234567"); // 7 chars, below minimum boundary
        
        mockMvc.perform(post("/auth/register/customer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testPasswordLength_Boundary_8_ReturnsCreated() throws Exception {
        request.setPassword("12345678"); // 8 chars, strictly on boundary
        
        when(authService.registerCustomer(any(CustomerRegistrationRequest.class))).thenReturn(new UserRespond());
        
        mockMvc.perform(post("/auth/register/customer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void testPasswordLength_Boundary_9_ReturnsCreated() throws Exception {
        request.setPassword("123456789"); // 9 chars, above minimum boundary
        
        when(authService.registerCustomer(any(CustomerRegistrationRequest.class))).thenReturn(new UserRespond());
        
        mockMvc.perform(post("/auth/register/customer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }
}
