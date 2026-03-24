package com.ev.ai_service.service;

import com.ev.ai_service.client.InventoryServiceClient;
import com.ev.ai_service.client.SalesServiceClient;
import com.ev.ai_service.client.VehicleServiceClient;
import com.ev.ai_service.dto.*;
import com.ev.ai_service.entity.DemandForecast;
import com.ev.ai_service.entity.SalesHistory;
import com.ev.ai_service.repository.DemandForecastRepository;
import com.ev.ai_service.repository.InventorySnapshotRepository;
import com.ev.ai_service.repository.ProductionPlanRepository;
import com.ev.ai_service.repository.SalesHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DemandForecastServiceTest {

        @Mock
        private ForecastAlgorithmService algorithmService;
        @Mock
        private SalesHistoryRepository salesHistoryRepository;
        @Mock
        private InventorySnapshotRepository inventorySnapshotRepository;
        @Mock
        private DemandForecastRepository forecastRepository;
        @Mock
        private ProductionPlanRepository productionPlanRepository;
        @Mock
        private VehicleServiceClient vehicleServiceClient;
        @Mock
        private GeminiAIService geminiAIService;
        @Mock
        private SalesServiceClient salesServiceClient;
        @Mock
        private InventoryServiceClient inventoryServiceClient;
        @Mock
        private DemandForecastService self;

        @InjectMocks
        private DemandForecastService demandForecastService;

        private ForecastRequest request;

        @BeforeEach
        void setUp() {
                request = new ForecastRequest();
                request.setVariantId(1L);
                request.setDaysToForecast(30);
                request.setRegion("North");
                request.setForecastMethod("AUTO");
        }

        @Test
        @DisplayName("Tạo dự báo Demand thành công - Phương thức AUTO")
        void generateForecast_auto_success() {
                // Mock traditional forecast
                when(algorithmService.forecastAuto(anyLong(), anyInt(), anyInt())).thenReturn(100);
                when(algorithmService.calculateConfidence(anyLong(), anyInt())).thenReturn(0.85);
                when(algorithmService.analyzeTrend(anyLong(), anyInt())).thenReturn("INCREASING");

                // Mock additional data
                when(salesHistoryRepository.sumQuantityByVariantAndDateRange(anyLong(), any(), any())).thenReturn(1500);
                when(inventorySnapshotRepository.findTopByVariantIdOrderBySnapshotDateDesc(anyLong()))
                                .thenReturn(Optional.empty());

                // Mock vehicle info
                VehicleServiceClient.VehicleVariantInfo variantInfo = new VehicleServiceClient.VehicleVariantInfo();
                variantInfo.setVersionName("Pro");
                variantInfo.setModelName("VF8");
                when(vehicleServiceClient.getVariantInfo(1L)).thenReturn(variantInfo);

                ForecastResponse response = demandForecastService.generateForecast(request);

                assertThat(response).isNotNull();
                assertThat(response.getForecasts()).hasSize(1);
                ForecastResult result = response.getForecasts().get(0);
                assertThat(result.getVariantId()).isEqualTo(1L);
                assertThat(result.getPredictedDemand()).isEqualTo(100);
                assertThat(result.getConfidenceScore()).isEqualTo(0.85);
                assertThat(result.getTrend()).isEqualTo("INCREASING");
                assertThat(result.getForecastMethod()).isEqualTo("AUTO");

                verify(forecastRepository).save(any(DemandForecast.class));
        }

        @Test
        @DisplayName("Tạo dự báo Demand thành công - Phương thức OPENAI (Gemini)")
        void generateForecast_openai_success() {
                request.setForecastMethod("OPENAI");

                // Mock historical data for AI
                when(salesHistoryRepository.findByVariantIdAndDateRange(anyLong(), any(), any()))
                                .thenReturn(List.of(new SalesHistory(), new SalesHistory(), new SalesHistory(),
                                                new SalesHistory(),
                                                new SalesHistory(),
                                                new SalesHistory(), new SalesHistory(), new SalesHistory(),
                                                new SalesHistory(),
                                                new SalesHistory(), new SalesHistory()));

                // Mock Gemini service
                ForecastResult aiResult = ForecastResult.builder()
                                .predictedDemand(120)
                                .confidenceScore(0.92)
                                .trend("STABLE")
                                .build();
                when(geminiAIService.generateForecastWithAI(anyLong(), anyString(), anyString(), anyList(), anyList(),
                                anyInt(),
                                anyString()))
                                .thenReturn(aiResult);

                // Mock other dependencies
                when(salesHistoryRepository.sumQuantityByVariantAndDateRange(anyLong(), any(), any())).thenReturn(1200);
                when(inventorySnapshotRepository.findTopByVariantIdOrderBySnapshotDateDesc(anyLong()))
                                .thenReturn(Optional.empty());

                ForecastResponse response = demandForecastService.generateForecast(request);

                assertThat(response).isNotNull();
                assertThat(response.getForecasts()).hasSize(1);
                ForecastResult result = response.getForecasts().get(0);
                assertThat(result.getPredictedDemand()).isEqualTo(120);
                assertThat(result.getForecastMethod()).isEqualTo("GEMINI");
        }

        @Test
        @DisplayName("Xác định variant IDs từ list trong request")
        void generateForecast_withMultipleVariantIds() {
                request.setVariantId(null);
                request.setVariantIds(List.of(1L, 2L, 3L));

                when(algorithmService.forecastAuto(anyLong(), anyInt(), anyInt())).thenReturn(50);
                when(algorithmService.calculateConfidence(anyLong(), anyInt())).thenReturn(0.8);
                when(algorithmService.analyzeTrend(anyLong(), anyInt())).thenReturn("STABLE");

                ForecastResponse response = demandForecastService.generateForecast(request);

                assertThat(response.getForecasts()).hasSize(3);
        }

        @Test
        @DisplayName("Xác định variant IDs - Fallback về top selling nếu request trống")
        void generateForecast_fallbackToTopSelling() {
                request.setVariantId(null);
                request.setVariantIds(null);

                Object[] row1 = new Object[] { 10L, 500L };
                Object[] row2 = new Object[] { 11L, 400L };
                when(salesHistoryRepository.getTopSellingVariants(any(), any())).thenReturn(List.of(row1, row2));
                when(algorithmService.forecastAuto(anyLong(), anyInt(), anyInt())).thenReturn(50);
                when(algorithmService.calculateConfidence(anyLong(), anyInt())).thenReturn(0.8);
                when(algorithmService.analyzeTrend(anyLong(), anyInt())).thenReturn("STABLE");

                ForecastResponse response = demandForecastService.generateForecast(request);

                assertThat(response.getForecasts()).hasSize(2);
                assertThat(response.getForecasts().get(0).getVariantId()).isEqualTo(10L);
        }

        @Test
        @DisplayName("Làm giàu dữ liệu lịch sử từ REST APIs")
        void enrichHistoricalDataFromRestApis_success() {
                UUID dealerId = UUID.randomUUID();

                SalesServiceClient.SalesHistoryDto salesDto = new SalesServiceClient.SalesHistoryDto();
                salesDto.setOrderId(UUID.randomUUID());
                salesDto.setOrderDate(LocalDate.now());
                salesDto.setQuantity(5);
                salesDto.setVariantId(1L);
                when(salesServiceClient.getSalesHistory(anyLong(), any(), any(), any(), anyInt()))
                                .thenReturn(List.of(salesDto));

                InventoryServiceClient.InventorySnapshotDto invDto = new InventoryServiceClient.InventorySnapshotDto();
                invDto.setVariantId(1L);
                invDto.setAvailableQuantity(50);
                when(inventoryServiceClient.getInventorySnapshots(anyLong(), any(), anyInt()))
                                .thenReturn(List.of(invDto));

                demandForecastService.enrichHistoricalDataFromRestApis(1L, dealerId, 60);

                verify(salesHistoryRepository, atLeastOnce()).save(any());
                verify(inventorySnapshotRepository, atLeastOnce()).save(any());
        }

        @Test
        @DisplayName("Dự báo AI và làm giàu dữ liệu khi thiếu dữ liệu lịch sử")
        void forecastForVariant_enrichmentFlow() {
                request.setForecastMethod("OPENAI");

                // Mock vehicle metadata call
                VehicleServiceClient.VehicleVariantInfo variantInfo = new VehicleServiceClient.VehicleVariantInfo();
                variantInfo.setVersionName("Plus");
                variantInfo.setModelName("VF8");
                when(vehicleServiceClient.getVariantInfo(anyLong())).thenReturn(variantInfo);

                // Mock insufficient data (empty list) initially
                when(salesHistoryRepository.findByVariantIdAndDateRange(anyLong(), any(), any()))
                                .thenReturn(Collections.emptyList()) // First call in performAiForecast
                                .thenReturn(List.of(new com.ev.ai_service.entity.SalesHistory())); // Second call after
                                                                                                   // enrichment

                // Mock enrich success
                // Note: enrichment calls self.enrichHistoricalDataFromRestApis, which we should
                // mock or spy
                // But here we just want to see it calls the salesServiceClient
                when(salesServiceClient.getSalesHistory(anyLong(), any(), any(), any(), anyInt()))
                                .thenReturn(List.of(new SalesServiceClient.SalesHistoryDto()));

                // Mock AI service call
                ForecastResult aiResult = new ForecastResult();
                aiResult.setPredictedDemand(150);
                aiResult.setConfidenceScore(0.85);
                aiResult.setTrend("UPWARD");
                when(geminiAIService.generateForecastWithAI(anyLong(), anyString(), anyString(), anyList(), anyList(),
                                anyInt(), anyString())).thenReturn(aiResult);

                // Inject real self to allow enrichment flow to proceed
                org.springframework.test.util.ReflectionTestUtils.setField(demandForecastService, "self",
                                demandForecastService);

                // Call the internal private logic via reflection to test it
                ForecastResult result = org.springframework.test.util.ReflectionTestUtils.invokeMethod(
                                demandForecastService, "forecastForVariant", 1L, request, 30, 30);

                assertThat(result).isNotNull();
                assertThat(result.getPredictedDemand()).isEqualTo(150);
                verify(salesServiceClient, atLeastOnce()).getSalesHistory(anyLong(), any(), any(), any(), anyInt());
        }
}
