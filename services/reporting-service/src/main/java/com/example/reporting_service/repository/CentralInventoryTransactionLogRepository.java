package com.example.reporting_service.repository;

import com.example.reporting_service.model.CentralInventoryTransactionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CentralInventoryTransactionLogRepository
        extends JpaRepository<CentralInventoryTransactionLog, Long>,
                JpaSpecificationExecutor<CentralInventoryTransactionLog> {

    List<CentralInventoryTransactionLog> findByVariantId(Long variantId);

    List<CentralInventoryTransactionLog> findByTransactionDateBetweenOrderByTransactionDateDesc(
            LocalDateTime start, LocalDateTime end);

    List<CentralInventoryTransactionLog> findAllByOrderByTransactionDateDesc();
}
