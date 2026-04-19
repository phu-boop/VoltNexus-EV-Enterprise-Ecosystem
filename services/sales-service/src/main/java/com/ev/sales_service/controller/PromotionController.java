package com.ev.sales_service.controller;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.sales_service.dto.request.PromotionRequest;
import com.ev.sales_service.dto.response.PromotionResponse;
import com.ev.sales_service.entity.Promotion;
import com.ev.sales_service.enums.PromotionStatus;
import com.ev.sales_service.mapper.PromotionMapper;
import com.ev.sales_service.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@RestController
@RequestMapping("/promotions")
@RequiredArgsConstructor
public class PromotionController {

        private final PromotionService promotionService;
        private final PromotionMapper promotionMapper;

        @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER')")
        @PostMapping
        public ResponseEntity<ApiRespond<PromotionResponse>> createPromotion(@RequestBody PromotionRequest request) {
                Promotion promotion = promotionMapper.toEntity(request);
                Promotion saved = promotionService.createPromotion(promotion);
                return ResponseEntity
                                .ok(ApiRespond.success("Promotion created successfully",
                                                promotionMapper.toResponse(saved)));
        }

        @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER')")
        @PutMapping("/{id}")
        public ResponseEntity<ApiRespond<PromotionResponse>> updatePromotion(
                        @PathVariable UUID id,
                        @RequestBody PromotionRequest request,
                        @RequestHeader(value = "X-User-Roles", required = false) String roles,
                        @RequestHeader(value = "X-User-DealerId", required = false) String currentUserDealerId) {

                Promotion promotion = promotionMapper.toEntity(request);
                Promotion updated = promotionService.updatePromotion(id, promotion, roles, currentUserDealerId);
                return ResponseEntity
                                .ok(ApiRespond.success("Promotion updated successfully",
                                                promotionMapper.toResponse(updated)));
        }

        // chuyển status sang active dành cho admin/evm_staff
        @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
        @PutMapping("/authentic/{id}")
        public ResponseEntity<ApiRespond<PromotionResponse>> authenticPromotion(
                        @PathVariable UUID id,
                        @RequestHeader(value = "X-User-Roles", required = false) String roles) {

                Promotion updated = promotionService.authenticPromotion(id, roles);
                return ResponseEntity
                                .ok(ApiRespond.success("Promotion authenticated successfully",
                                                promotionMapper.toResponse(updated)));
        }

        @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER', 'DEALER_STAFF')")
        @GetMapping("/{id}")
        public ResponseEntity<ApiRespond<PromotionResponse>> getPromotionById(@PathVariable UUID id) {
                Promotion promotion = promotionService.getPromotionById(id);
                return ResponseEntity
                                .ok(ApiRespond.success("Promotion fetched successfully",
                                                promotionMapper.toResponse(promotion)));
        }

        @GetMapping
        public ResponseEntity<ApiRespond<List<PromotionResponse>>> getAllPromotions() {
                List<Promotion> promotions = promotionService.getAllPromotions();
                return ResponseEntity.ok(
                                ApiRespond.success("All promotions fetched successfully",
                                                promotionMapper.toResponseList(promotions)));
        }

        @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
        @DeleteMapping("/{id}")
        public ResponseEntity<ApiRespond<Void>> deletePromotion(
                        @PathVariable UUID id,
                        @RequestHeader(value = "X-User-Roles", required = false) String roles,
                        @RequestHeader(value = "X-User-DealerId", required = false) String currentUserDealerId) {

                promotionService.deletePromotion(id, roles, currentUserDealerId);
                return ResponseEntity.ok(ApiRespond.success("Promotion deleted successfully", null));
        }

        @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER', 'DEALER_STAFF')")
        @GetMapping("/status/{status}")
        public ResponseEntity<ApiRespond<List<PromotionResponse>>> getPromotionsByStatus(
                        @PathVariable PromotionStatus status) {
                List<Promotion> list = promotionService.getPromotionsByStatus(status);
                return ResponseEntity.ok(
                                ApiRespond.success("Promotions fetched by status successfully",
                                                promotionMapper.toResponseList(list)));
        }

        @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER', 'DEALER_STAFF')")
        @GetMapping("/search")
        public ResponseEntity<ApiRespond<List<PromotionResponse>>> searchPromotions(
                        @RequestParam(required = false) String status,
                        @RequestParam(required = false) String modelId,
                        @RequestParam(required = false) String dealerId,
                        @RequestParam(required = false) String searchTerm,
                        @RequestHeader(value = "X-User-Roles", required = false) String roles,
                        @RequestHeader(value = "X-User-DealerId", required = false) String currentUserDealerId) {

                List<Promotion> list = promotionService.searchPromotions(status, modelId, dealerId, searchTerm, roles,
                                currentUserDealerId);
                return ResponseEntity.ok(
                                ApiRespond.success("Promotions searched successfully",
                                                promotionMapper.toResponseList(list)));
        }

        /**
         * API cho frontend (Form Báo giá) lấy các KM đang active của đại lý
         */
        @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER', 'DEALER_STAFF', 'CUSTOMER')")
        @GetMapping("/dealer/active")
        public ResponseEntity<ApiRespond<List<PromotionResponse>>> getActivePromotionsForDealer(
                        @RequestHeader(value = "X-User-DealerId", required = false) String dealerId,
                        @RequestParam(required = false) Long modelId) {

                if (dealerId == null || dealerId.isEmpty()) {
                        return ResponseEntity.ok(ApiRespond.success("No dealer ID provided", List.of()));
                }

                // Truyền modelId (có thể null) vào service
                List<Promotion> activePromotions = promotionService.getActivePromotionsForDealer(
                                UUID.fromString(dealerId),
                                Optional.ofNullable(modelId));
                return ResponseEntity.ok(ApiRespond.success("Active promotions for dealer fetched successfully",
                                promotionMapper.toResponseList(activePromotions)));
        }

        /**
         * API cho frontend lấy tất cả khuyến mãi đang ACTIVE (không phụ thuộc dealer)
         * Có thể truyền modelId để lọc thêm.
         * Endpoint: GET /promotions/active
         */
        @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER', 'DEALER_STAFF', 'CUSTOMER')")
        @GetMapping("/active")
        public ResponseEntity<ApiRespond<List<PromotionResponse>>> getActivePromotions(
                        @RequestParam(required = false) Long modelId) {

                List<Promotion> activePromotions = promotionService.getActivePromotions(Optional.ofNullable(modelId));
                return ResponseEntity.ok(ApiRespond.success("Active promotions fetched successfully",
                                promotionMapper.toResponseList(activePromotions)));
        }

        /**
         * API dành riêng cho Dealer Staff View (chỉ lấy ACTIVE/NEAR của dealer đó)
         */
        @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER', 'DEALER_STAFF')")
        @GetMapping("/dealer/active-view")
        public ResponseEntity<ApiRespond<List<PromotionResponse>>> getActivePromotionsForDealerList(
                        @RequestHeader(value = "X-User-DealerId", required = false) String dealerId) {

                if (dealerId == null || dealerId.isEmpty()) {
                        return ResponseEntity.ok(
                                        ApiRespond.success("No dealer ID provided, returning empty list", List.of()));
                }

                List<Promotion> list = promotionService.getActivePromotionsForDealerList(UUID.fromString(dealerId));
                return ResponseEntity.ok(ApiRespond.success("Active promotions for dealer view fetched successfully",
                                promotionMapper.toResponseList(list)));
        }
}
