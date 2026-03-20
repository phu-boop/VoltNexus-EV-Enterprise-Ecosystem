package com.ev.customer_service.service;

import com.ev.customer_service.dto.request.AddToCartRequest;
import com.ev.customer_service.dto.request.UpdateCartItemRequest;
import com.ev.customer_service.dto.response.CartItemResponse;
import com.ev.customer_service.dto.response.CartSummaryResponse;

import java.util.List;

public interface CartService {

    /**
     * Thêm sản phẩm vào giỏ hàng
     * Nếu sản phẩm đã tồn tại, tăng quantity
     */
    CartItemResponse addToCart(Long customerId, AddToCartRequest request);

    /**
     * Lấy tất cả items trong giỏ hàng của customer
     */
    List<CartItemResponse> getCartItems(Long customerId);

    /**
     * Lấy tổng quan giỏ hàng (items + tổng tiền)
     */
    CartSummaryResponse getCartSummary(Long customerId);

    /**
     * Cập nhật cart item (quantity, selected features)
     */
    CartItemResponse updateCartItem(Long customerId, Long cartItemId, UpdateCartItemRequest request);

    /**
     * Xóa một item khỏi giỏ hàng
     */
    void removeCartItem(Long customerId, Long cartItemId);

    /**
     * Xóa tất cả items khỏi giỏ hàng
     */
    void clearCart(Long customerId);

    /**
     * Đếm số lượng items trong giỏ hàng
     */
    Long getCartItemCount(Long customerId);

    /**
     * Đếm số lượng items trong giỏ hàng bằng profileId
     */
    Long getCartItemCountByProfileId(String profileId);
}
