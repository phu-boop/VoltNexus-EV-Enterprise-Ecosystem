package com.example.reporting_service.repository;

import com.example.reporting_service.model.SalesRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SalesRecordRepository extends JpaRepository<SalesRecord, UUID> {
    List<SalesRecord> findByModelName(String modelName);
    boolean existsByOrderId(UUID orderId);
    @org.springframework.data.jpa.repository.Query("SELECT MAX(s.orderDate) FROM SalesRecord s")
    java.time.LocalDateTime findMaxOrderDate();
    
    // New methods for Feature 5 Advanced Reporting
    List<SalesRecord> findByOrderDateBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
    List<SalesRecord> findByDealerNameAndOrderDateBetween(String dealerName, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);
}
