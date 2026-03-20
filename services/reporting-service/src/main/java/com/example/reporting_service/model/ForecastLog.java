package com.example.reporting_service.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "forecast_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String modelName; // "ALL" or specific model name

    @Column(columnDefinition = "TEXT")
    private String responseJson;

    private LocalDateTime createdAt;
}
