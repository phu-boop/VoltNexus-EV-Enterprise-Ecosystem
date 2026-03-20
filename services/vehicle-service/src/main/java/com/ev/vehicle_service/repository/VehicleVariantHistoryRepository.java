package com.ev.vehicle_service.repository;

import com.ev.vehicle_service.model.VehicleVariantHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface VehicleVariantHistoryRepository extends JpaRepository<VehicleVariantHistory, Long> {

}
