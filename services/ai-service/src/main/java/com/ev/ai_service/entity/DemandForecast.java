package com.ev.ai_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity lưu trữ kết quả dự báo nhu cầu
 */
@Entity
@Table(name = "demand_forecast", indexes = {
    @Index(name = "idx_forecast_period", columnList = "forecastDate,createdAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandForecast {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long variantId;
    
    @Column
    private UUID dealerId; // null = forecast cho toàn quốc
    
    @Column(length = 100)
    private String region; // null = forecast cho toàn quốc
    
    @Column(nullable = false)
    private LocalDate forecastDate; // Ngày dự báo
    
    @Column(nullable = false)
    private Integer predictedDemand; // Số lượng dự báo
    
    @Column
    private Double confidenceScore; // Độ tin cậy (0-1)
    
    @Column(length = 50, nullable = false)
    private String forecastMethod; // MOVING_AVERAGE, LINEAR_REGRESSION, etc.
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    // Metadata
    @Column(length = 100)
    private String modelName;
    
    @Column(length = 100)
    private String variantName;
    
    // Thông tin bổ sung cho phân tích
    @Column
    private Integer actualDemand; // Cập nhật sau khi có dữ liệu thực tế
    
    @Column
    private Double accuracy; // Độ chính xác sau khi có actual
}
