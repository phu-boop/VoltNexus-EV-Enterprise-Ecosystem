package com.ev.ai_service.repository;

import com.ev.ai_service.entity.DemandForecast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface DemandForecastRepository extends JpaRepository<DemandForecast, Long> {
    
    List<DemandForecast> findByVariantIdAndForecastDateBetween(
        Long variantId, 
        LocalDate startDate, 
        LocalDate endDate
    );
    
    List<DemandForecast> findByDealerIdAndForecastDateBetween(
        UUID dealerId, 
        LocalDate startDate, 
        LocalDate endDate
    );
    
    List<DemandForecast> findByRegionAndForecastDateBetween(
        String region, 
        LocalDate startDate, 
        LocalDate endDate
    );
    
    @Query("SELECT df FROM DemandForecast df WHERE df.forecastDate BETWEEN :startDate AND :endDate " +
           "ORDER BY df.predictedDemand DESC")
    List<DemandForecast> findTopForecastsByDateRange(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    @Query("SELECT SUM(df.predictedDemand) FROM DemandForecast df " +
           "WHERE df.forecastDate BETWEEN :startDate AND :endDate")
    Integer sumPredictedDemandByDateRange(
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
