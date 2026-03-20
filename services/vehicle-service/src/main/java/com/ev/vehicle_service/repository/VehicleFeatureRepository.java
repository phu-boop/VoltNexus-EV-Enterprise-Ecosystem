package com.ev.vehicle_service.repository;

import com.ev.vehicle_service.model.VehicleFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for VehicleFeature entity.
 * Provides standard CRUD operations through JpaRepository.
 */
@Repository
public interface VehicleFeatureRepository extends JpaRepository<VehicleFeature, Long> {

    Optional<VehicleFeature> findByFeatureName(String featureName);

}