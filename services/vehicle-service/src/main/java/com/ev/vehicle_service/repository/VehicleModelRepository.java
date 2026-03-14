package com.ev.vehicle_service.repository;

import com.ev.vehicle_service.model.VehicleModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleModelRepository extends JpaRepository<VehicleModel, Long> {
    /**
     * Lấy tất cả các Model và tải sẵn (eagerly fetch) danh sách các Variant của
     * chúng
     * để giải quyết vấn đề N+1 Select khi lấy danh sách.
     */
    @Query("SELECT DISTINCT m FROM VehicleModel m LEFT JOIN FETCH m.variants")
    List<VehicleModel> findAllWithVariants();

    /**
     * Lấy một Model theo ID và tải sẵn tất cả các mối quan hệ liên quan (variants,
     * features)
     * để giải quyết vấn đề N+1 Select khi xem chi tiết.
     */
    @Query("SELECT m FROM VehicleModel m " +
            "LEFT JOIN FETCH m.variants v " +
            "LEFT JOIN FETCH v.features f " +
            "LEFT JOIN FETCH f.vehicleFeature " +
            "WHERE m.modelId = :modelId")
    Optional<VehicleModel> findModelWithDetailsById(@Param("modelId") Long modelId);

    /**
     * Search models with pagination - Optimized query
     */
    @Query("SELECT DISTINCT m FROM VehicleModel m " +
            "WHERE (:keyword IS NULL OR m.modelName LIKE %:keyword% OR m.brand LIKE %:keyword%) " +
            "AND (:status IS NULL OR m.status = :status)")
    Page<VehicleModel> searchModels(
            @Param("keyword") String keyword,
            @Param("status") com.ev.common_lib.model.enums.VehicleStatus status,
            Pageable pageable);

    /**
     * Find models by price range - Optimized with index on variants.price
     */
    @Query("SELECT DISTINCT m FROM VehicleModel m " +
            "JOIN m.variants v " +
            "WHERE v.price BETWEEN :minPrice AND :maxPrice " +
            "GROUP BY m.modelId " +
            "HAVING MIN(v.price) >= :minPrice")
    List<VehicleModel> findModelsByPriceRange(
            @Param("minPrice") java.math.BigDecimal minPrice,
            @Param("maxPrice") java.math.BigDecimal maxPrice);

    /**
     * Find models by range (km) - Optimized
     */
    @Query("SELECT m FROM VehicleModel m " +
            "WHERE m.baseRangeKm BETWEEN :minRange AND :maxRange " +
            "OR EXISTS (SELECT v FROM VehicleVariant v WHERE v.vehicleModel.modelId = m.modelId " +
            "AND v.rangeKm BETWEEN :minRange AND :maxRange)")
    List<VehicleModel> findModelsByRange(
            @Param("minRange") Integer minRange,
            @Param("maxRange") Integer maxRange);
}
