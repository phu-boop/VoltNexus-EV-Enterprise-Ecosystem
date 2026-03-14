package com.ev.ai_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO cho kế hoạch sản xuất
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionPlanDto {
    
    private Long id;
    private Long variantId;
    private String variantName;
    private String modelName;
    private LocalDate planMonth;
    private Integer recommendedProduction;
    private Integer predictedDemand;
    private Integer currentInventory;
    private Integer productionGap;
    private String priority;
    private String recommendations;
    private String status;
}
