package com.ev.payment_service.controller;

import com.ev.payment_service.dto.request.VnpayInitiateRequest;
import com.ev.payment_service.service.Interface.IVnpayService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(VnpayGatewayController.class)
@AutoConfigureMockMvc(addFilters = false)
class VnpayGatewayControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IVnpayService vnpayService;

    @Autowired
    private ObjectMapper objectMapper;

    private VnpayInitiateRequest request;

    @BeforeEach
    void setUp() {
        request = new VnpayInitiateRequest();
        request.setCustomerId(1L);
        request.setOrderId(UUID.randomUUID());
        request.setPaymentAmount(new BigDecimal("1000000.00"));
        request.setTotalAmount(new BigDecimal("1000000.00"));
    }

    @Test
    void initiateB2CPayment_ShouldReturnUrl() throws Exception {
        when(vnpayService.createVnpayPaymentUrl(any(), any(), any())).thenReturn("http://vnpay.url");

        mockMvc.perform(post("/api/v1/payments/gateway/initiate-b2c")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.paymentUrl").value("http://vnpay.url"));
    }

    @Test
    void getCallback_ShouldReturnSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/payments/gateway/callback/vnpay"))
                .andExpect(status().isOk());
    }
}
