package com.ev.payment_service.controller;

import com.ev.payment_service.dto.request.PaymentMethodRequest;
import com.ev.payment_service.dto.response.PaymentMethodResponse;
import com.ev.payment_service.service.Interface.IPaymentMethodService;
import com.ev.payment_service.enums.PaymentMethodType;
import com.ev.payment_service.enums.PaymentScope;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PaymentMethodController.class)
@AutoConfigureMockMvc(addFilters = false)
class PaymentMethodControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private IPaymentMethodService paymentMethodService;

    @Autowired
    private ObjectMapper objectMapper;

    private PaymentMethodRequest request;
    private PaymentMethodResponse response;

    @BeforeEach
    void setUp() {
        request = new PaymentMethodRequest();
        request.setMethodName("VNPay");
        request.setMethodType(PaymentMethodType.GATEWAY);
        request.setScope(PaymentScope.ALL);
        request.setActive(true);

        response = new PaymentMethodResponse();
        response.setMethodId(UUID.randomUUID());
        response.setMethodName("VNPay");
        response.setMethodType(PaymentMethodType.GATEWAY);
        response.setScope(PaymentScope.ALL);
        response.setActive(true);
    }

    @Test
    void createPaymentMethod_ShouldReturnCreated() throws Exception {
        when(paymentMethodService.createPaymentMethod(any(PaymentMethodRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/payments/methods")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.methodName").value("VNPay"));
    }

    @Test
    void getAllPaymentMethods_ShouldReturnList() throws Exception {
        when(paymentMethodService.getAllPaymentMethods()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/payments/methods"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].methodName").value("VNPay"));
    }

    @Test
    void getActivePublicMethods_ShouldReturnList() throws Exception {
        when(paymentMethodService.getActivePublicMethods()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/payments/methods/active-public"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].methodName").value("VNPay"));
    }
}
