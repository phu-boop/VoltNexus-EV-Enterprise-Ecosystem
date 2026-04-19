package com.ev.vehicle_service.repository;

import com.ev.vehicle_service.model.VariantFeature;
import com.ev.vehicle_service.model.VariantFeatureId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VariantFeatureRepository extends JpaRepository<VariantFeature, VariantFeatureId> {
    boolean existsByVehicleFeature_FeatureId(Long featureId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "vehicleVariant",
            "vehicleVariant.vehicleModel" })
    java.util.List<VariantFeature> findByVehicleFeature_FeatureId(Long featureId);
}
