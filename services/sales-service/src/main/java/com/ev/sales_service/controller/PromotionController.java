package com.ev.sales_service.controller;

import com.ev.sales_service.entity.Promotion;
import com.ev.sales_service.enums.PromotionStatus;
import com.ev.sales_service.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@RestController
@RequestMapping("/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @PostMapping
    public ResponseEntity<Promotion> createPromotion(@RequestBody Promotion promotion) {
        Promotion saved = promotionService.createPromotion(promotion);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Promotion> updatePromotion(@PathVariable UUID id, @RequestBody Promotion promotion) {
        Promotion updated = promotionService.updatePromotion(id, promotion);
        return ResponseEntity.ok(updated);
    }

    //chuyển status sang active dành cho admin
    @PutMapping("/authentic/{id}")
    public ResponseEntity<Promotion> authenticPromotion(@PathVariable UUID id) {
        Promotion updated = promotionService.authenticPromotion(id);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Promotion> getPromotionById(@PathVariable UUID id) {
        Promotion promotion = promotionService.getPromotionById(id);
        return ResponseEntity.ok(promotion);
    }

    @GetMapping
    public ResponseEntity<List<Promotion>> getAllPromotions() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromotion(@PathVariable UUID id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Promotion>> getPromotionsByStatus(@PathVariable PromotionStatus status) {
        List<Promotion> list = promotionService.getPromotionsByStatus(status);
        return ResponseEntity.ok(list);
    }

    /**
     * API cho frontend (Form Báo giá) lấy các KM đang active của đại lý
     */
    @GetMapping("/dealer/active")
    public ResponseEntity<List<Promotion>> getActivePromotionsForDealer(
            @RequestHeader("X-Dealer-Id") UUID dealerId,
            @RequestParam(required = false) Long modelId) { // <-- THÊM THAM SỐ NÀY

        // Truyền modelId (có thể null) vào service
        List<Promotion> activePromotions = promotionService.getActivePromotionsForDealer(dealerId, Optional.ofNullable(modelId));
        return ResponseEntity.ok(activePromotions);
    }

    /**
     * API cho frontend lấy tất cả khuyến mãi đang ACTIVE (không phụ thuộc dealer)
     * Có thể truyền modelId để lọc thêm.
     * Endpoint: GET /promotions/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<Promotion>> getActivePromotions(
            @RequestParam(required = false) Long modelId) {

        List<Promotion> activePromotions = promotionService.getActivePromotions(Optional.ofNullable(modelId));
        return ResponseEntity.ok(activePromotions);
    }
}
