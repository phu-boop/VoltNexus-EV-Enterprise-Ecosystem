package com.ev.sales_service.mapper;

import com.ev.sales_service.dto.request.PromotionRequest;
import com.ev.sales_service.dto.response.PromotionResponse;
import com.ev.sales_service.entity.Promotion;
import com.ev.sales_service.enums.PromotionStatus;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PromotionMapperTest {

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private PromotionMapper promotionMapper;

    private Promotion promotion;
    private PromotionRequest request;

    @BeforeEach
    void setUp() {
        promotion = Promotion.builder()
                .promotionId(UUID.randomUUID())
                .promotionName("Summer Sale")
                .description("Big discount for EV fans!")
                .discountRate(new BigDecimal("15.5"))
                .startDate(LocalDateTime.now().minusDays(5))
                .endDate(LocalDateTime.now().plusWeeks(2))
                .status(PromotionStatus.ACTIVE)
                .dealerIdJson("[\"de46d29b-8e10-4660-848e-20f9a2656976\"]")
                .applicableModelsJson("[101, 102]")
                .build();

        request = PromotionRequest.builder()
                .promotionName("Black Friday")
                .description("Mega Deals!")
                .discountRate(new BigDecimal("20.0"))
                .startDate(LocalDateTime.now().plusDays(10))
                .endDate(LocalDateTime.now().plusDays(15))
                .status(PromotionStatus.DRAFT)
                .applicableDealers(List.of(UUID.randomUUID()))
                .applicableModels(List.of(1L, 2L))
                .build();
    }

    @Test
    void toEntity_ShouldMapCorrectly() throws Exception {
        when(objectMapper.writeValueAsString(any())).thenReturn("[\"serialized\"]");

        Promotion entity = promotionMapper.toEntity(request);

        assertThat(entity).isNotNull();
        assertThat(entity.getPromotionName()).isEqualTo(request.getPromotionName());
        assertThat(entity.getDiscountRate()).isEqualTo(request.getDiscountRate());
        assertThat(entity.getDealerIdJson()).isEqualTo("[\"serialized\"]");
        assertThat(entity.getApplicableModelsJson()).isEqualTo("[\"serialized\"]");
    }

    @Test
    void toResponse_ShouldMapCorrectly() throws Exception {
        UUID dealerId = UUID.fromString("de46d29b-8e10-4660-848e-20f9a2656976");
        when(objectMapper.readValue(eq(promotion.getDealerIdJson()), any(TypeReference.class)))
                .thenReturn(List.of(dealerId));
        when(objectMapper.readValue(eq(promotion.getApplicableModelsJson()), any(TypeReference.class)))
                .thenReturn(List.of(101L, 102L));

        PromotionResponse response = promotionMapper.toResponse(promotion);

        assertThat(response).isNotNull();
        assertThat(response.getPromotionId()).isEqualTo(promotion.getPromotionId());
        assertThat(response.getPromotionName()).isEqualTo(promotion.getPromotionName());
        assertThat(response.getApplicableDealers()).containsOnly(dealerId);
        assertThat(response.getApplicableModels()).containsOnly(101L, 102L);
        assertThat(response.getIsActive()).isTrue();
    }

    @Test
    void toResponseList_ShouldHandleEmptyList() {
        List<PromotionResponse> results = promotionMapper.toResponseList(null);
        assertThat(results).isEmpty();
    }
}
