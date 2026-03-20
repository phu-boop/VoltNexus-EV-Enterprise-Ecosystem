package com.example.reporting_service.repository;

import com.example.reporting_service.model.VehicleCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository cho bảng cache thông tin Xe (Vehicle/Variant).
 */
@Repository
public interface VehicleCacheRepository extends JpaRepository<VehicleCache, Long> {
    
}
