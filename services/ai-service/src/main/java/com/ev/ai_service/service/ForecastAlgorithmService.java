package com.ev.ai_service.service;

import com.ev.ai_service.entity.SalesHistory;
import com.ev.ai_service.repository.SalesHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.math3.stat.regression.SimpleRegression;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Service chứa các thuật toán ML/AI cơ bản cho dự báo nhu cầu
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ForecastAlgorithmService {
    
    private final SalesHistoryRepository salesHistoryRepository;
    
    /**
     * Dự báo sử dụng Moving Average (Trung bình động)
     * Phù hợp cho dữ liệu ổn định, không có trend mạnh
     */
    public Integer forecastWithMovingAverage(Long variantId, int daysToAverage, int daysToForecast) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(daysToAverage);
        
        List<SalesHistory> histories = salesHistoryRepository
            .findByVariantIdAndSaleDateBetween(variantId, startDate, endDate);
        
        if (histories.isEmpty()) {
            log.warn("No historical data for variant {}", variantId);
            return 0;
        }
        
        // Tính trung bình số lượng bán mỗi ngày
        int totalQuantity = histories.stream()
            .mapToInt(SalesHistory::getQuantity)
            .sum();
        
        double avgPerDay = (double) totalQuantity / daysToAverage;
        
        // Dự báo cho số ngày tới
        return (int) Math.round(avgPerDay * daysToForecast);
    }
    
    /**
     * Dự báo sử dụng Linear Regression (Hồi quy tuyến tính)
     * Phù hợp khi có trend tăng/giảm rõ ràng
     */
    public Integer forecastWithLinearRegression(Long variantId, int daysHistory, int daysToForecast) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(daysHistory);
        
        List<SalesHistory> histories = salesHistoryRepository
            .findByVariantIdAndSaleDateBetween(variantId, startDate, endDate);
        
        if (histories.size() < 2) {
            log.warn("Not enough data for linear regression on variant {}", variantId);
            return forecastWithMovingAverage(variantId, daysHistory, daysToForecast);
        }
        
        // Chuẩn bị dữ liệu cho regression
        SimpleRegression regression = new SimpleRegression();
        
        for (SalesHistory history : histories) {
            long daysSinceStart = ChronoUnit.DAYS.between(startDate, history.getSaleDate());
            regression.addData(daysSinceStart, history.getQuantity());
        }
        
        // Dự báo cho ngày tương lai
        double futureDay = daysHistory + daysToForecast;
        double predictedQuantity = regression.predict(futureDay);
        
        // Đảm bảo không trả về số âm
        return Math.max(0, (int) Math.round(predictedQuantity));
    }
    
    /**
     * Weighted Moving Average - Trọng số cao hơn cho dữ liệu gần đây
     */
    public Integer forecastWithWeightedAverage(Long variantId, int daysHistory, int daysToForecast) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(daysHistory);
        
        List<SalesHistory> histories = salesHistoryRepository
            .findByVariantIdAndSaleDateBetween(variantId, startDate, endDate);
        
        if (histories.isEmpty()) {
            return 0;
        }
        
        double weightedSum = 0;
        double totalWeight = 0;
        
        for (int i = 0; i < histories.size(); i++) {
            double weight = i + 1; // Càng gần hiện tại, weight càng cao
            weightedSum += histories.get(i).getQuantity() * weight;
            totalWeight += weight;
        }
        
        double avgPerDay = weightedSum / totalWeight;
        return (int) Math.round(avgPerDay * daysToForecast);
    }
    
    /**
     * Exponential Smoothing - Làm mượt dữ liệu với trọng số exponential
     */
    public Integer forecastWithExponentialSmoothing(Long variantId, int daysHistory, int daysToForecast, double alpha) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(daysHistory);
        
        List<SalesHistory> histories = salesHistoryRepository
            .findByVariantIdAndSaleDateBetween(variantId, startDate, endDate);
        
        if (histories.isEmpty()) {
            return 0;
        }
        
        // Khởi tạo với giá trị đầu tiên
        double smoothedValue = histories.get(0).getQuantity();
        
        // Áp dụng exponential smoothing
        for (int i = 1; i < histories.size(); i++) {
            smoothedValue = alpha * histories.get(i).getQuantity() + (1 - alpha) * smoothedValue;
        }
        
        return (int) Math.round(smoothedValue * daysToForecast);
    }
    
    /**
     * Phương pháp AUTO: Tự động chọn thuật toán tốt nhất
     * Dựa trên phân tích trend và seasonality
     */
    public Integer forecastAuto(Long variantId, int daysHistory, int daysToForecast) {
        // Phân tích trend
        String trend = analyzeTrend(variantId, daysHistory);
        
        log.info("Detected trend for variant {}: {}", variantId, trend);
        
        // Chọn thuật toán phù hợp
        return switch (trend) {
            case "INCREASING", "DECREASING" -> 
                forecastWithLinearRegression(variantId, daysHistory, daysToForecast);
            case "VOLATILE" -> 
                forecastWithWeightedAverage(variantId, daysHistory, daysToForecast);
            default -> 
                forecastWithMovingAverage(variantId, daysHistory, daysToForecast);
        };
    }
    
    /**
     * Phân tích trend của dữ liệu
     */
    public String analyzeTrend(Long variantId, int daysHistory) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(daysHistory);
        
        List<SalesHistory> histories = salesHistoryRepository
            .findByVariantIdAndSaleDateBetween(variantId, startDate, endDate);
        
        if (histories.size() < 3) {
            return "STABLE";
        }
        
        // Tính slope sử dụng linear regression
        SimpleRegression regression = new SimpleRegression();
        for (int i = 0; i < histories.size(); i++) {
            regression.addData(i, histories.get(i).getQuantity());
        }
        
        double slope = regression.getSlope();
        double rSquared = regression.getRSquare();
        
        // Phân loại trend
        if (rSquared < 0.3) {
            return "VOLATILE"; // Dữ liệu không ổn định
        } else if (slope > 0.5) {
            return "INCREASING";
        } else if (slope < -0.5) {
            return "DECREASING";
        } else {
            return "STABLE";
        }
    }
    
    /**
     * Tính confidence score cho dự báo
     */
    public Double calculateConfidence(Long variantId, int daysHistory) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(daysHistory);
        
        List<SalesHistory> histories = salesHistoryRepository
            .findByVariantIdAndSaleDateBetween(variantId, startDate, endDate);
        
        if (histories.isEmpty()) {
            return 0.0;
        }
        
        // Confidence dựa trên:
        // 1. Số lượng data points
        // 2. Độ ổn định của dữ liệu (variance)
        double dataScore = Math.min(1.0, histories.size() / 30.0); // Max khi có >= 30 ngày
        
        // Tính variance
        double mean = histories.stream()
            .mapToInt(SalesHistory::getQuantity)
            .average()
            .orElse(0);
        
        double variance = histories.stream()
            .mapToDouble(h -> Math.pow(h.getQuantity() - mean, 2))
            .average()
            .orElse(0);
        
        double stabilityScore = 1.0 / (1.0 + Math.sqrt(variance) / (mean + 1));
        
        return (dataScore + stabilityScore) / 2.0;
    }
}
