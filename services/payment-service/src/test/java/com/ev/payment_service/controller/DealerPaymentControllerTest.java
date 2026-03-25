package com.ev.payment_service.controller;

import com.ev.payment_service.config.UserPrincipal;
import com.ev.payment_service.dto.request.CreateDealerInvoiceRequest;
import com.ev.payment_service.dto.response.DealerInvoiceResponse;
import com.ev.payment_service.service.Interface.IDealerPaymentService;
import com.ev.payment_service.service.Interface.IVnpayService;
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
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DealerPaymentController.class)
@AutoConfigureMockMvc(addFilters = false)
class DealerPaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private IDealerPaymentService dealerPaymentService;

    @MockitoBean
    private IVnpayService vnpayService;

    @MockitoBean
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private CreateDealerInvoiceRequest request;
    private DealerInvoiceResponse response;
    private UserPrincipal staffPrincipal;

    @BeforeEach
    void setUp() {
        request = new CreateDealerInvoiceRequest();
        request.setDealerId(UUID.randomUUID());
        request.setOrderId(UUID.randomUUID());
        request.setAmount(new BigDecimal("5000000.00"));
        request.setDueDate(java.time.LocalDate.now().plusDays(7));
        request.setNotes("Monthly dealer fees");

        response = new DealerInvoiceResponse();
        response.setDealerInvoiceId(UUID.randomUUID());
        response.setDealerId(request.getDealerId());
        response.setTotalAmount(request.getAmount());

        staffPrincipal = new UserPrincipal(
                "staff@ev.com",
                "EVM_STAFF",
                UUID.randomUUID(),
                UUID.randomUUID());

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                staffPrincipal, null, staffPrincipal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void createInvoice_ShouldReturnCreated() throws Exception {
        when(dealerPaymentService.createDealerInvoice(any(), any())).thenReturn(response);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                staffPrincipal, null, staffPrincipal.getAuthorities());

        mockMvc.perform(post("/api/v1/payments/dealer/invoices")
                .with(authentication(auth))
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.dealerId").value(request.getDealerId().toString()))
                .andExpect(jsonPath("$.totalAmount").value(5000000.00));
    }

    @Test
    void getInvoices_ShouldReturnList() throws Exception {
        UUID dealerId = UUID.randomUUID();
        mockMvc.perform(get("/api/v1/payments/dealer/{dealerId}/invoices", dealerId))
                .andExpect(status().isOk());
    }
}
