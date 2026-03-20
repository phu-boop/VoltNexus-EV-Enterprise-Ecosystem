package com.ev.customer_service.repository;

import com.ev.customer_service.entity.ChargingStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository for ChargingStation entity
 */
@Repository
public interface ChargingStationRepository extends JpaRepository<ChargingStation, Long> {

    /**
     * Find all active charging stations
     */
    List<ChargingStation> findByStatusOrderByStationNameAsc(ChargingStation.StationStatus status);

    /**
     * Find charging stations by city
     */
    List<ChargingStation> findByCityAndStatusOrderByStationNameAsc(String city, ChargingStation.StationStatus status);

    /**
     * Find charging stations by province
     */
    List<ChargingStation> findByProvinceAndStatusOrderByStationNameAsc(String province, ChargingStation.StationStatus status);

    /**
     * Find public charging stations
     */
    List<ChargingStation> findByIsPublicAndStatusOrderByStationNameAsc(Boolean isPublic, ChargingStation.StationStatus status);

    /**
     * Find charging stations within a radius (using Haversine formula)
     * This is a simplified query - for production, consider using spatial databases
     */
    @Query(value = "SELECT * FROM charging_stations cs WHERE cs.status = :status " +
            "AND (6371 * acos(cos(radians(:latitude)) * cos(radians(cs.latitude)) * " +
            "cos(radians(cs.longitude) - radians(:longitude)) + sin(radians(:latitude)) * " +
            "sin(radians(cs.latitude)))) <= :radiusKm " +
            "ORDER BY (6371 * acos(cos(radians(:latitude)) * cos(radians(cs.latitude)) * " +
            "cos(radians(cs.longitude) - radians(:longitude)) + sin(radians(:latitude)) * " +
            "sin(radians(cs.latitude))))",
            nativeQuery = true)
    List<ChargingStation> findStationsNearby(
            @Param("latitude") BigDecimal latitude,
            @Param("longitude") BigDecimal longitude,
            @Param("radiusKm") Double radiusKm,
            @Param("status") String status);

    /**
     * Search stations by name or address
     */
    @Query("SELECT cs FROM ChargingStation cs WHERE cs.status = :status AND " +
            "(LOWER(cs.stationName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(cs.address) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<ChargingStation> searchStations(@Param("keyword") String keyword, @Param("status") ChargingStation.StationStatus status);
}
