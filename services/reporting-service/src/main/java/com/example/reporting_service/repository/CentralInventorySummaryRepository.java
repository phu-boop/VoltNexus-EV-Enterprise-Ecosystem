package com.example.reporting_service.repository;

import com.example.reporting_service.model.CentralInventorySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CentralInventorySummaryRepository 
        extends JpaRepository<CentralInventorySummary, Long>,
                JpaSpecificationExecutor<CentralInventorySummary> {

    Optional<CentralInventorySummary> findByVariantId(Long variantId);
}
