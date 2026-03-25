package com.ev.sales_service.service;

import com.ev.sales_service.entity.Promotion;
import com.ev.sales_service.enums.PromotionStatus;
import com.ev.sales_service.repository.OutboxRepository;
import com.ev.sales_service.repository.PromotionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PromotionServiceTest {

    @Mock
    private PromotionRepository promotionRepository;

    @Mock
    private OutboxRepository outboxRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private PromotionService promotionService;

    private Promotion promotion;

    @BeforeEach
    void setUp() {
        promotion = Promotion.builder()
                .promotionId(UUID.randomUUID())
                .promotionName("Test Promotion")
                .description("Test Description")
                .discountRate(new BigDecimal("10.0"))
                .startDate(LocalDateTime.now().minusDays(1))
                .endDate(LocalDateTime.now().plusDays(1))
                .status(PromotionStatus.DRAFT)
                .build();
    }

    @Test
    void createPromotion_ShouldSavePromotionAndOutbox() throws Exception {
        when(promotionRepository.save(any(Promotion.class))).thenReturn(promotion);
        when(objectMapper.writeValueAsString(any())).thenReturn("{}");

        Promotion saved = promotionService.createPromotion(promotion);

        assertThat(saved).isNotNull();
        assertThat(saved.getStatus()).isEqualTo(PromotionStatus.DRAFT);
        verify(promotionRepository).save(any(Promotion.class));
        verify(outboxRepository).save(any());
    }

    @Test
    void updatePromotion_ShouldUpdateExistingFields() {
        when(promotionRepository.findById(promotion.getPromotionId())).thenReturn(Optional.of(promotion));
        when(promotionRepository.save(any(Promotion.class))).thenReturn(promotion);

        Promotion updateData = Promotion.builder()
                .promotionName("Updated Name")
                .status(PromotionStatus.ACTIVE)
                .build();

        Promotion updated = promotionService.updatePromotion(promotion.getPromotionId(), updateData);

        assertThat(updated).isNotNull();
        assertThat(updated.getPromotionName()).isEqualTo("Updated Name");
        verify(promotionRepository).save(any(Promotion.class));
    }

    @Test
    void getPromotionById_ShouldReturnPromotion() {
        when(promotionRepository.findById(promotion.getPromotionId())).thenReturn(Optional.of(promotion));

        Promotion result = promotionService.getPromotionById(promotion.getPromotionId());

        assertThat(result).isEqualTo(promotion);
    }

    @Test
    void getAllPromotions_ShouldReturnList() {
        when(promotionRepository.findAll()).thenReturn(List.of(promotion));

        List<Promotion> result = promotionService.getAllPromotions();

        assertThat(result).hasSize(1);
        verify(promotionRepository, atLeastOnce()).findAll();
    }

    @Test
    void deletePromotion_ShouldSetStatusToDeleted() {
        when(promotionRepository.findById(promotion.getPromotionId())).thenReturn(Optional.of(promotion));

        promotionService.deletePromotion(promotion.getPromotionId());

        assertThat(promotion.getStatus()).isEqualTo(PromotionStatus.DELETED);
        verify(promotionRepository).save(promotion);
    }

    @Test
    void getActivePromotions_ShouldReturnFilteredList() {
        promotion.setStatus(PromotionStatus.ACTIVE);
        when(promotionRepository.findByStatus(PromotionStatus.ACTIVE)).thenReturn(List.of(promotion));

        List<Promotion> result = promotionService.getActivePromotions(Optional.empty());

        assertThat(result).hasSize(1);
    }
}
