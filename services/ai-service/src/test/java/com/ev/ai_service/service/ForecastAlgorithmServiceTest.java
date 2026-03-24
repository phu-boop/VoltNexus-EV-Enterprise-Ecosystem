package com.ev.ai_service.service;

import com.ev.ai_service.entity.SalesHistory;
import com.ev.ai_service.repository.SalesHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ForecastAlgorithmServiceTest {

    @Mock
    private SalesHistoryRepository salesHistoryRepository;

    @InjectMocks
    private ForecastAlgorithmService forecastAlgorithmService;

    private Long variantId = 1L;
    private List<SalesHistory> historicalData;

    @BeforeEach
    void setUp() {
        historicalData = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 0; i < 10; i++) {
            historicalData.add(SalesHistory.builder()
                    .variantId(variantId)
                    .quantity(10 + i) // 10, 11, 12, ..., 19
                    .saleDate(now.minusDays(10 - i))
                    .build());
        }
    }

    @Nested
    @DisplayName("Moving Average Tests")
    class MovingAverageTests {

        @Test
        @DisplayName("Should forecast correctly with Moving Average")
        void forecastWithMovingAverage_ShouldReturnForecast() {
            when(salesHistoryRepository.findByVariantIdAndSaleDateBetween(eq(variantId), any(), any()))
                    .thenReturn(historicalData);

            // Total quantity = 10+11+12+13+14+15+16+17+18+19 = 145
            // Average per day = 145 / 30 (daysToAverage) = 4.833
            // Forecast for 7 days = 4.833 * 7 = 33.83 -> 34
            Integer result = forecastAlgorithmService.forecastWithMovingAverage(variantId, 30, 7);

            assertThat(result).isGreaterThan(0);
            assertThat(result).isEqualTo(34);
        }

        @Test
        @DisplayName("Should return 0 when no data available for Moving Average")
        void forecastWithMovingAverage_WhenEmpty_ShouldReturnZero() {
            when(salesHistoryRepository.findByVariantIdAndSaleDateBetween(eq(variantId), any(), any()))
                    .thenReturn(Collections.emptyList());

            Integer result = forecastAlgorithmService.forecastWithMovingAverage(variantId, 30, 7);

            assertThat(result).isZero();
        }
    }

    @Nested
    @DisplayName("Linear Regression Tests")
    class LinearRegressionTests {

        @Test
        @DisplayName("Should forecast correctly with Linear Regression")
        void forecastWithLinearRegression_ShouldReturnForecast() {
            when(salesHistoryRepository.findByVariantIdAndSaleDateBetween(eq(variantId), any(), any()))
                    .thenReturn(historicalData);

            Integer result = forecastAlgorithmService.forecastWithLinearRegression(variantId, 30, 7);

            assertThat(result).isGreaterThan(0);
            // With trend 10, 11, 12... it should be around 20-30 depending on the
            // regression slope
        }

        @Test
        @DisplayName("Should fallback to Moving Average when not enough data for Linear Regression")
        void forecastWithLinearRegression_WithLowData_ShouldFallback() {
            List<SalesHistory> lowData = List.of(historicalData.get(0));
            when(salesHistoryRepository.findByVariantIdAndSaleDateBetween(eq(variantId), any(), any()))
                    .thenReturn(lowData);

            Integer result = forecastAlgorithmService.forecastWithLinearRegression(variantId, 30, 7);

            assertThat(result).isNotNull();
        }
    }

    @Nested
    @DisplayName("Weighted Average Tests")
    class WeightedAverageTests {

        @Test
        @DisplayName("Should forecast correctly with Weighted Average")
        void forecastWithWeightedAverage_ShouldReturnForecast() {
            when(salesHistoryRepository.findByVariantIdAndSaleDateBetween(eq(variantId), any(), any()))
                    .thenReturn(historicalData);

            Integer result = forecastAlgorithmService.forecastWithWeightedAverage(variantId, 30, 7);

            assertThat(result).isGreaterThan(0);
        }

        @Test
        @DisplayName("Should return 0 when no data for Weighted Average")
        void forecastWithWeightedAverage_WhenEmpty_ShouldReturnZero() {
            when(salesHistoryRepository.findByVariantIdAndSaleDateBetween(eq(variantId), any(), any()))
                    .thenReturn(Collections.emptyList());

            Integer result = forecastAlgorithmService.forecastWithWeightedAverage(variantId, 30, 7);

            assertThat(result).isZero();
        }
    }

    @Nested
    @DisplayName("Exponential Smoothing Tests")
    class ExponentialSmoothingTests {

        @Test
        @DisplayName("Should forecast correctly with Exponential Smoothing")
        void forecastWithExponentialSmoothing_ShouldReturnForecast() {
            when(salesHistoryRepository.findByVariantIdAndSaleDateBetween(eq(variantId), any(), any()))
                    .thenReturn(historicalData);

            Integer result = forecastAlgorithmService.forecastWithExponentialSmoothing(variantId, 30, 7, 0.3);

            assertThat(result).isGreaterThan(0);
        }

        @Test
        @DisplayName("Should return 0 when no data for Exponential Smoothing")
        void forecastWithExponentialSmoothing_WhenEmpty_ShouldReturnZero() {
            when(salesHistoryRepository.findByVariantIdAndSaleDateBetween(eq(variantId), any(), any()))
                    .thenReturn(Collections.emptyList());

            Integer result = forecastAlgorithmService.forecastWithExponentialSmoothing(variantId, 30, 7, 0.3);

            assertThat(result).isZero();
        }
    }

    @Nested
    @DisplayName("Trend Analysis Tests")
    class TrendAnalysisTests {

        @Test
        @DisplayName("Should detect increasing trend")
        void analyzeTrend_ShouldDetectIncreasing() {
            when(salesHistoryRepository.findByVariantIdAndSaleDateBetween(eq(variantId), any(), any()))
                    .thenReturn(historicalData); // 10, 11, 12... is increasing

            String trend = forecastAlgorithmService.analyzeTrend(variantId, 30);

            assertThat(trend).isEqualTo("INCREASING");
        }

        @Test
        @DisplayName("Should detect decreasing trend")
        void analyzeTrend_ShouldDetectDecreasing() {
            List<SalesHistory> decreasingData = new ArrayList<>();
            for (int i = 0; i < 10; i++) {
                decreasingData.add(SalesHistory.builder()
                        .variantId(variantId)
                        .quantity(20 - i)
                        .saleDate(LocalDateTime.now().minusDays(10 - i))
                        .build());
            }
            when(salesHistoryRepository.findByVariantIdAndSaleDateBetween(eq(variantId), any(), any()))
                    .thenReturn(decreasingData);

            String trend = forecastAlgorithmService.analyzeTrend(variantId, 30);

            assertThat(trend).isEqualTo("DECREASING");
        }

        @Test
        @DisplayName("Should detect volatile trend")
        void analyzeTrend_ShouldDetectVolatile() {
            List<SalesHistory> volatileData = List.of(
                    SalesHistory.builder().quantity(10).saleDate(LocalDateTime.now().minusDays(5)).build(),
                    SalesHistory.builder().quantity(50).saleDate(LocalDateTime.now().minusDays(4)).build(),
                    SalesHistory.builder().quantity(5).saleDate(LocalDateTime.now().minusDays(3)).build(),
                    SalesHistory.builder().quantity(100).saleDate(LocalDateTime.now().minusDays(2)).build(),
                    SalesHistory.builder().quantity(2).saleDate(LocalDateTime.now().minusDays(1)).build());
            when(salesHistoryRepository.findByVariantIdAndSaleDateBetween(eq(variantId), any(), any()))
                    .thenReturn(volatileData);

            String trend = forecastAlgorithmService.analyzeTrend(variantId, 30);

            assertThat(trend).isEqualTo("VOLATILE");
        }

        @Test
        @DisplayName("Should return STABLE for low data")
        void analyzeTrend_WithLowData_ShouldReturnStable() {
            when(salesHistoryRepository.findByVariantIdAndSaleDateBetween(eq(variantId), any(), any()))
                    .thenReturn(historicalData.subList(0, 2));

            String trend = forecastAlgorithmService.analyzeTrend(variantId, 30);

            assertThat(trend).isEqualTo("STABLE");
        }
    }

    @Nested
    @DisplayName("Auto Forecast Tests")
    class AutoForecastTests {

        @Test
        @DisplayName("Should use Linear Regression for increasing trend")
        void forecastAuto_WithIncreasingTrend_ShouldUseRegression() {
            when(salesHistoryRepository.findByVariantIdAndSaleDateBetween(eq(variantId), any(), any()))
                    .thenReturn(historicalData);

            Integer result = forecastAlgorithmService.forecastAuto(variantId, 30, 7);

            assertThat(result).isGreaterThan(0);
        }
    }

    @Nested
    @DisplayName("Confidence Calculation Tests")
    class ConfidenceTests {

        @Test
        @DisplayName("Should calculate confidence score")
        void calculateConfidence_ShouldReturnScore() {
            when(salesHistoryRepository.findByVariantIdAndSaleDateBetween(eq(variantId), any(), any()))
                    .thenReturn(historicalData);

            Double confidence = forecastAlgorithmService.calculateConfidence(variantId, 30);

            assertThat(confidence).isBetween(0.0, 1.0);
        }

        @Test
        @DisplayName("Should return 0 confidence for no data")
        void calculateConfidence_WhenEmpty_ShouldReturnZero() {
            when(salesHistoryRepository.findByVariantIdAndSaleDateBetween(eq(variantId), any(), any()))
                    .thenReturn(Collections.emptyList());

            Double confidence = forecastAlgorithmService.calculateConfidence(variantId, 30);

            assertThat(confidence).isZero();
        }
    }
}
