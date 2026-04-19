package com.example.reporting_service.repository;

import com.example.reporting_service.model.ForecastLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ForecastLogRepository extends JpaRepository<ForecastLog, Long> {
    Optional<ForecastLog> findTopByModelNameOrderByCreatedAtDesc(String modelName);
}
