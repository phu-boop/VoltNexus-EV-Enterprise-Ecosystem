package com.ev.ai_service.repository;

import com.ev.ai_service.entity.ProductionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProductionPlanRepository extends JpaRepository<ProductionPlan, Long> {
    
    List<ProductionPlan> findByPlanMonthAndStatus(LocalDate planMonth, String status);
    
    List<ProductionPlan> findByPlanMonthBetweenOrderByPriorityAsc(
        LocalDate startMonth, 
        LocalDate endMonth
    );
    
    @Query("SELECT pp FROM ProductionPlan pp WHERE pp.planMonth = :month " +
           "ORDER BY pp.priority DESC, pp.productionGap DESC")
    List<ProductionPlan> findPriorityPlansByMonth(@Param("month") LocalDate month);
    
    // Tìm existing plan theo variant và tháng
    ProductionPlan findByVariantIdAndPlanMonth(Long variantId, LocalDate planMonth);
}
