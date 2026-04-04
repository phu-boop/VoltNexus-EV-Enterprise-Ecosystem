package com.ev.user_service.controller;

import com.ev.user_service.dto.request.CustomerRegistrationRequest;
import com.ev.user_service.dto.respond.UserRespond;
import com.ev.user_service.service.AuthService;
import com.ev.user_service.service.LoginAttemptService;
import com.ev.user_service.service.RecaptchaService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
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
        // password, phone, birthday to be explicitly tested
        request.setPassword("12345678"); // default valid
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

    // --- Phone BVA (^pattern [0-9]{10,12}$) ---
    @Test
    void testPhone_Length_9_ReturnsBadRequest() throws Exception {
        request.setPhone("123456789"); // 9 chars, below min
        mockMvc.perform(post("/auth/register/customer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testPhone_Length_10_ReturnsCreated() throws Exception {
        request.setPhone("1234567890"); // 10 chars, at min
        when(authService.registerCustomer(any())).thenReturn(new UserRespond());
        mockMvc.perform(post("/auth/register/customer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void testPhone_Length_11_ReturnsCreated() throws Exception {
        request.setPhone("12345678901"); // 11 chars
        when(authService.registerCustomer(any())).thenReturn(new UserRespond());
        mockMvc.perform(post("/auth/register/customer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void testPhone_Length_12_ReturnsCreated() throws Exception {
        request.setPhone("123456789012"); // 12 chars, at max
        when(authService.registerCustomer(any())).thenReturn(new UserRespond());
        mockMvc.perform(post("/auth/register/customer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void testPhone_Length_13_ReturnsBadRequest() throws Exception {
        request.setPhone("1234567890123"); // 13 chars, above max
        mockMvc.perform(post("/auth/register/customer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // --- Birthday BVA (@Past) ---
    @Test
    void testBirthday_Yesterday_ReturnsCreated() throws Exception {
        request.setBirthday(LocalDate.now().minusDays(1)); // past date
        when(authService.registerCustomer(any())).thenReturn(new UserRespond());
        mockMvc.perform(post("/auth/register/customer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void testBirthday_Today_ReturnsBadRequest() throws Exception {
        request.setBirthday(LocalDate.now()); // today (violates @Past)
        mockMvc.perform(post("/auth/register/customer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testBirthday_Tomorrow_ReturnsBadRequest() throws Exception {
        request.setBirthday(LocalDate.now().plusDays(1)); // future date
        mockMvc.perform(post("/auth/register/customer")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
