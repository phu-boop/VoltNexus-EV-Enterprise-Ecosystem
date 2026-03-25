package com.ev.payment_service.controller;

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
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DealerPaymentController.class)
@AutoConfigureMockMvc(addFilters = false)
class DealerPaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IDealerPaymentService dealerPaymentService;

    @MockBean
    private IVnpayService vnpayService;

    @MockBean
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private CreateDealerInvoiceRequest request;
    private DealerInvoiceResponse response;

    @BeforeEach
    void setUp() {
        request = new CreateDealerInvoiceRequest();
        request.setDealerId(UUID.randomUUID());
        request.setAmount(new BigDecimal("5000000.00"));
        request.setNotes("Monthly dealer fees");

        response = new DealerInvoiceResponse();
        response.setDealerInvoiceId(UUID.randomUUID());
        response.setDealerId(request.getDealerId());
        response.setTotalAmount(request.getAmount());
    }

    @Test
    void createInvoice_ShouldReturnCreated() throws Exception {
        when(dealerPaymentService.createDealerInvoice(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/payments/dealer/invoices")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.totalAmount").value(5000000.00));
    }

    @Test
    void getInvoices_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/v1/payments/dealer/invoices"))
                .andExpect(status().isOk());
    }
}
