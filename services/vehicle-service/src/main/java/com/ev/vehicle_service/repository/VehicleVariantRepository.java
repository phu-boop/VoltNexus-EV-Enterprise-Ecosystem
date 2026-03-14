package com.ev.vehicle_service.repository;

import com.ev.vehicle_service.model.VehicleVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface VehicleVariantRepository extends JpaRepository<VehicleVariant, Long>, JpaSpecificationExecutor<VehicleVariant> {
    
    // Tìm kiếm variantId theo keyword
    @Query("SELECT v.variantId FROM VehicleVariant v WHERE v.vehicleModel.modelName LIKE %:keyword% OR v.versionName LIKE %:keyword% OR v.color LIKE %:keyword%")
    List<Long> findVariantIdsByKeyword(@Param("keyword") String keyword);

    @Query("SELECT v FROM VehicleVariant v " +
           "LEFT JOIN FETCH v.vehicleModel " +
           "LEFT JOIN FETCH v.features " + 
           "WHERE v.variantId IN :variantIds")
    List<VehicleVariant> findAllWithDetailsByIds(List<Long> variantIds);
    
    List<VehicleVariant> findByVehicleModel_ModelId(Long modelId);

    @Query("SELECT v.variantId FROM VehicleVariant v")
    List<Long> findAllVariantIds();

    @Override
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"vehicleModel"})
    org.springframework.data.domain.Page<VehicleVariant> findAll(org.springframework.data.jpa.domain.Specification<VehicleVariant> spec, org.springframework.data.domain.Pageable pageable);

}
