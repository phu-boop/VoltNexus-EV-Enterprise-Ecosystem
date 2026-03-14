package com.ev.customer_service.repository;

import com.ev.customer_service.entity.CustomerProfileAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerProfileAuditRepository extends JpaRepository<CustomerProfileAudit, Long> {
    
    /**
     * Find all audit records for a specific customer, ordered by newest first
     */
    List<CustomerProfileAudit> findByCustomerIdOrderByChangedAtDesc(Long customerId);
}
