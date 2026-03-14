package com.ev.ai_service.repository;

import com.ev.ai_service.entity.SalesHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SalesHistoryRepository extends JpaRepository<SalesHistory, Long> {
    
    List<SalesHistory> findByVariantIdAndSaleDateBetween(
        Long variantId, 
        LocalDateTime startDate, 
        LocalDateTime endDate
    );
    
    // Alias for findByVariantIdAndSaleDateBetween
    default List<SalesHistory> findByVariantIdAndDateRange(
        Long variantId, 
        LocalDateTime startDate, 
        LocalDateTime endDate
    ) {
        return findByVariantIdAndSaleDateBetween(variantId, startDate, endDate);
    }
    
    List<SalesHistory> findByDealerIdAndSaleDateBetween(
        UUID dealerId, 
        LocalDateTime startDate, 
        LocalDateTime endDate
    );
    
    List<SalesHistory> findByRegionAndSaleDateBetween(
        String region, 
        LocalDateTime startDate, 
        LocalDateTime endDate
    );
    
    @Query("SELECT SUM(s.quantity) FROM SalesHistory s WHERE s.variantId = :variantId " +
           "AND s.saleDate BETWEEN :startDate AND :endDate AND s.orderStatus = 'COMPLETED'")
    Integer sumQuantityByVariantAndDateRange(
        @Param("variantId") Long variantId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT s.region, SUM(s.quantity) as totalSales FROM SalesHistory s " +
           "WHERE s.saleDate BETWEEN :startDate AND :endDate AND s.orderStatus = 'COMPLETED' " +
           "GROUP BY s.region")
    List<Object[]> getSalesByRegion(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT s.variantId, s.variantName, SUM(s.quantity) as totalSales FROM SalesHistory s " +
           "WHERE s.saleDate BETWEEN :startDate AND :endDate AND s.orderStatus = 'COMPLETED' " +
           "GROUP BY s.variantId, s.variantName ORDER BY totalSales DESC")
    List<Object[]> getTopSellingVariants(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}
