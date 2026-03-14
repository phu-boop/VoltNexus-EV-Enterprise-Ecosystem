package com.ev.inventory_service.repository;

import com.ev.inventory_service.model.TransferRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransferRequestRepository extends JpaRepository<TransferRequest, Long> {
    
}
