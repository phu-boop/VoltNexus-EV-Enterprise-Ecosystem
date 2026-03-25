package com.ev.sales_service.controller;

import com.ev.sales_service.dto.request.PromotionRequest;
import com.ev.sales_service.dto.response.PromotionResponse;
import com.ev.sales_service.entity.Promotion;
import com.ev.sales_service.enums.PromotionStatus;
import com.ev.sales_service.mapper.PromotionMapper;
import com.ev.sales_service.service.PromotionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PromotionController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for simplicity
class PromotionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PromotionService promotionService;

    @MockitoBean
    private PromotionMapper promotionMapper;

    @Autowired
    private ObjectMapper objectMapper;

    private Promotion promotion;
    private PromotionRequest request;
    private PromotionResponse response;

    @BeforeEach
    void setUp() {
        promotion = new Promotion();
        promotion.setPromotionId(UUID.randomUUID());
        promotion.setPromotionName("Independence Day");

        request = PromotionRequest.builder()
                .promotionName("National Day Sale")
                .discountRate(new BigDecimal("10.0"))
                .status(PromotionStatus.DRAFT)
                .build();

        response = PromotionResponse.builder()
                .promotionId(promotion.getPromotionId())
                .promotionName("National Day Sale")
                .discountRate(new BigDecimal("10.0"))
                .status(PromotionStatus.DRAFT)
                .build();
    }

    @Test
    void createPromotion_ShouldReturnSuccess() throws Exception {
        when(promotionMapper.toEntity(any())).thenReturn(promotion);
        when(promotionService.createPromotion(any())).thenReturn(promotion);
        when(promotionMapper.toResponse(any())).thenReturn(response);

        mockMvc.perform(post("/promotions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.data.promotionName").value("National Day Sale"));
    }

    @Test
    void getPromotionById_ShouldReturnPromotionResponse() throws Exception {
        when(promotionService.getPromotionById(any())).thenReturn(promotion);
        when(promotionMapper.toResponse(any())).thenReturn(response);

        mockMvc.perform(get("/promotions/" + promotion.getPromotionId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.data.promotionId").value(promotion.getPromotionId().toString()));
    }

    @Test
    void getAllPromotions_ShouldReturnList() throws Exception {
        when(promotionService.getAllPromotions()).thenReturn(List.of(promotion));
        when(promotionMapper.toResponseList(any())).thenReturn(List.of(response));

        mockMvc.perform(get("/promotions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].promotionName").value("National Day Sale"));
    }

    @Test
    void deletePromotion_ShouldReturnSuccess() throws Exception {
        mockMvc.perform(delete("/promotions/" + promotion.getPromotionId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"));
    }
}
