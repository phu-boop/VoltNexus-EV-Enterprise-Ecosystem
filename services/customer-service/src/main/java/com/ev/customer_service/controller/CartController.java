package com.ev.customer_service.controller;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.customer_service.dto.request.AddToCartRequest;
import com.ev.customer_service.dto.request.UpdateCartItemRequest;
import com.ev.customer_service.dto.response.CartItemResponse;
import com.ev.customer_service.dto.response.CartSummaryResponse;
import com.ev.customer_service.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller quản lý giỏ hàng của khách hàng
 */
@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@Slf4j
public class CartController {

    private final CartService cartService;

    /**
     * Thêm sản phẩm vào giỏ hàng
     * POST /cart/{customerId}
     */
    @PostMapping("/{customerId}")
    public ResponseEntity<ApiRespond<CartItemResponse>> addToCart(
            @PathVariable Long customerId,
            @Valid @RequestBody AddToCartRequest request) {
        
        log.info("Adding to cart for customer: {}, variant: {}", customerId, request.getVariantId());
        
        CartItemResponse response = cartService.addToCart(customerId, request);
        return ResponseEntity.ok(ApiRespond.success("Đã thêm sản phẩm vào giỏ hàng", response));
    }

    /**
     * Lấy tất cả items trong giỏ hàng
     * GET /cart/{customerId}/items
     */
    @GetMapping("/{customerId}/items")
    public ResponseEntity<ApiRespond<List<CartItemResponse>>> getCartItems(@PathVariable Long customerId) {
        log.info("Getting cart items for customer: {}", customerId);
        
        List<CartItemResponse> items = cartService.getCartItems(customerId);
        return ResponseEntity.ok(ApiRespond.success("Lấy giỏ hàng thành công", items));
    }

    /**
     * Lấy tổng quan giỏ hàng (items + tổng tiền)
     * GET /cart/{customerId}/summary
     */
    @GetMapping("/{customerId}/summary")
    public ResponseEntity<ApiRespond<CartSummaryResponse>> getCartSummary(@PathVariable Long customerId) {
        log.info("Getting cart summary for customer: {}", customerId);
        
        CartSummaryResponse summary = cartService.getCartSummary(customerId);
        return ResponseEntity.ok(ApiRespond.success("Lấy tổng quan giỏ hàng thành công", summary));
    }

    /**
     * Cập nhật cart item (quantity, selected features)
     * PUT /cart/{customerId}/items/{cartItemId}
     */
    @PutMapping("/{customerId}/items/{cartItemId}")
    public ResponseEntity<ApiRespond<CartItemResponse>> updateCartItem(
            @PathVariable Long customerId,
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        
        log.info("Updating cart item {} for customer {}", cartItemId, customerId);
        
        CartItemResponse response = cartService.updateCartItem(customerId, cartItemId, request);
        return ResponseEntity.ok(ApiRespond.success("Cập nhật giỏ hàng thành công", response));
    }

    /**
     * Xóa một item khỏi giỏ hàng
     * DELETE /cart/{customerId}/items/{cartItemId}
     */
    @DeleteMapping("/{customerId}/items/{cartItemId}")
    public ResponseEntity<ApiRespond<Void>> removeCartItem(
            @PathVariable Long customerId,
            @PathVariable Long cartItemId) {
        
        log.info("Removing cart item {} for customer {}", cartItemId, customerId);
        
        cartService.removeCartItem(customerId, cartItemId);
        return ResponseEntity.ok(ApiRespond.success("Đã xóa sản phẩm khỏi giỏ hàng", null));
    }

    /**
     * Xóa tất cả items khỏi giỏ hàng
     * DELETE /cart/{customerId}/clear
     */
    @DeleteMapping("/{customerId}/clear")
    public ResponseEntity<ApiRespond<Void>> clearCart(@PathVariable Long customerId) {
        log.info("Clearing cart for customer {}", customerId);
        
        cartService.clearCart(customerId);
        return ResponseEntity.ok(ApiRespond.success("Đã xóa toàn bộ giỏ hàng", null));
    }

    /**
     * Đếm số lượng items trong giỏ hàng
     * GET /cart/{profileId}/count
     * @param profileId UUID of the customer's profile from User Service
     */
    @GetMapping("/{profileId}/count")
    public ResponseEntity<ApiRespond<Long>> getCartItemCount(@PathVariable String profileId) {
        log.info("Getting cart item count for profile {}", profileId);
        
        Long count = cartService.getCartItemCountByProfileId(profileId);
        return ResponseEntity.ok(ApiRespond.success("Đếm sản phẩm thành công", count));
    }
}
