package com.ev.payment_service.controller;

import com.ev.payment_service.config.UserPrincipal;
import com.ev.payment_service.dto.request.InitiatePaymentRequest;
import com.ev.payment_service.dto.response.InitiatePaymentResponse;
import com.ev.payment_service.repository.PaymentRecordRepository;
import com.ev.payment_service.service.Interface.ICustomerPaymentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CustomerPaymentController.class)
@AutoConfigureMockMvc(addFilters = false)
class CustomerPaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ICustomerPaymentService customerPaymentService;

    @MockitoBean
    private PaymentRecordRepository paymentRecordRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private InitiatePaymentRequest request;
    private InitiatePaymentResponse response;
    private UserPrincipal userPrincipal;

    @BeforeEach
    void setUp() {
        request = new InitiatePaymentRequest();
        request.setAmount(new BigDecimal("1000000.00"));
        request.setPaymentMethodId(UUID.randomUUID());

        response = InitiatePaymentResponse.builder()
                .paymentUrl("http://checkout.url")
                .status("PENDING_GATEWAY")
                .transactionId(UUID.randomUUID())
                .build();

        userPrincipal = new UserPrincipal(
                "customer@example.com",
                "CUSTOMER",
                UUID.randomUUID(),
                null);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userPrincipal, null, userPrincipal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void initiatePayment_ShouldReturnSuccess() throws Exception {
        UUID orderId = UUID.randomUUID();
        when(customerPaymentService.initiatePayment(any(UUID.class), any(InitiatePaymentRequest.class), anyString(),
                any(UUID.class)))
                .thenReturn(response);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(userPrincipal, null,
                userPrincipal.getAuthorities());

        mockMvc.perform(post("/api/v1/payments/customer/orders/{orderId}/pay", orderId)
                .with(authentication(auth))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.paymentUrl").value("http://checkout.url"));
    }

    @Test
    void getMyDeposits_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/payments/customer/my-deposits")
                .header("X-User-Email", "customer@example.com"))
                .andExpect(status().isOk());
    }
}
