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

       List<Promotion> findByStatusIn(List<PromotionStatus> statuses);

       @Query(value = "SELECT * FROM promotions p WHERE " +
                     "p.status != 'DELETED' AND " +
                     "(:status IS NULL OR p.status = :status) AND " +
                     "(:modelId IS NULL OR p.applicable_models_json IS NULL OR p.applicable_models_json = '[]' OR JSON_CONTAINS(p.applicable_models_json, :modelId)) AND "
                     +
                     "(:dealerId IS NULL OR p.dealer_id_json IS NULL OR p.dealer_id_json = '[]' OR JSON_CONTAINS(p.dealer_id_json, JSON_QUOTE(:dealerId))) AND "
                     +
                     "(:searchTerm IS NULL OR :searchTerm = '' OR p.promotion_name LIKE CONCAT('%', :searchTerm, '%') OR p.description LIKE CONCAT('%', :searchTerm, '%'))", nativeQuery = true)
       List<Promotion> searchPromotions(@Param("status") String status,
                     @Param("modelId") String modelId,
                     @Param("dealerId") String dealerId,
                     @Param("searchTerm") String searchTerm);

}
