package com.ev.sales_service.repository;

import com.ev.sales_service.entity.Promotion;
import com.ev.sales_service.enums.PromotionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface PromotionRepository extends JpaRepository<Promotion, UUID> {
    List<Promotion> findByStatus(PromotionStatus status);
    @Query("SELECT p FROM Promotion p WHERE p.status = 'ACTIVE' AND " +
           "p.startDate <= :currentDate AND p.endDate >= :currentDate")
    List<Promotion> findActivePromotions(@Param("currentDate") LocalDateTime currentDate);

    // Tìm promotion áp dụng cho model và dealer cụ thể
    @Query(value = "SELECT * FROM promotions p WHERE " +
           "p.status = 'ACTIVE' AND " +
           "p.start_date <= :currentDate AND p.end_date >= :currentDate AND " +
           "(p.applicable_models_json IS NULL OR JSON_CONTAINS(p.applicable_models_json, :modelId)) AND " +
           "(p.dealer_id_json IS NULL OR JSON_CONTAINS(p.dealer_id_json, :dealerId))",
           nativeQuery = true)
    List<Promotion> findApplicablePromotions(@Param("dealerId") String dealerId,
                                           @Param("modelId") String modelId,
                                           @Param("currentDate") LocalDateTime currentDate);

}
