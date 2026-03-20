package com.ev.ai_service.controller;

import com.ev.ai_service.dto.ProductionPlanDto;
import com.ev.ai_service.service.ProductionPlanService;
import com.ev.common_lib.dto.respond.ApiRespond;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST API Controller cho Production Planning
 */
@RestController
@RequestMapping("/api/ai/production-plan")
@RequiredArgsConstructor
@Slf4j
public class ProductionPlanController {

    private final ProductionPlanService productionPlanService;

    /**
     * Tạo kế hoạch sản xuất cho tháng
     * POST /api/ai/production-plan/generate
     */
    @PostMapping("/generate")
    public ResponseEntity<ApiRespond<List<ProductionPlanDto>>> generateProductionPlan(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate planMonth) {
        log.info("Generating production plan for month: {}", planMonth);

        try {
            List<ProductionPlanDto> plans = productionPlanService
                    .generateProductionPlan(planMonth);
            return ResponseEntity.ok(
                    ApiRespond.success("Production plan generated successfully", plans));
        } catch (Exception e) {
            log.error("Error generating production plan: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                    ApiRespond.error("ERROR", e.getMessage(), null));
        }
    }

    /**
     * Lấy kế hoạch sản xuất theo tháng
     * GET /api/ai/production-plan
     */
    @GetMapping("")
    public ResponseEntity<ApiRespond<List<ProductionPlanDto>>> getProductionPlans(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate month) {
        log.info("Getting production plans for month: {}", month);

        try {
            List<ProductionPlanDto> plans = productionPlanService
                    .getProductionPlansByMonth(month);
            return ResponseEntity.ok(
                    ApiRespond.success("Production plans retrieved successfully", plans));
        } catch (Exception e) {
            log.error("Error getting production plans: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                    ApiRespond.error("ERROR", e.getMessage(), null));
        }
    }

    /**
     * Approve kế hoạch sản xuất
     * PUT /api/ai/production-plan/{planId}/approve
     */
    @PutMapping("/{planId}/approve")
    public ResponseEntity<ApiRespond<ProductionPlanDto>> approveProductionPlan(
            @PathVariable Long planId) {
        log.info("Approving production plan: {}", planId);

        try {
            ProductionPlanDto plan = productionPlanService.approveProductionPlan(planId);
            return ResponseEntity.ok(
                    ApiRespond.success("Production plan approved successfully", plan));
        } catch (Exception e) {
            log.error("Error approving production plan: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(
                    ApiRespond.error("ERROR", e.getMessage(), null));
        }
    }
}
