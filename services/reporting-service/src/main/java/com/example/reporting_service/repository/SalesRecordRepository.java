package com.example.reporting_service.repository;

import com.example.reporting_service.model.SalesRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SalesRecordRepository extends JpaRepository<SalesRecord, UUID> {
    List<SalesRecord> findByModelName(String modelName);
    @org.springframework.data.jpa.repository.Query("SELECT MAX(s.orderDate) FROM SalesRecord s")
    java.time.LocalDateTime findMaxOrderDate();
}
