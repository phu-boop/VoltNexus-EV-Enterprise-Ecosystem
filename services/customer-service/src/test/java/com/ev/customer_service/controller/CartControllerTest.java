package com.ev.customer_service.controller;

import com.ev.customer_service.dto.request.AddToCartRequest;
import com.ev.customer_service.dto.request.UpdateCartItemRequest;
import com.ev.customer_service.dto.response.CartItemResponse;
import com.ev.customer_service.dto.response.CartSummaryResponse;
import com.ev.customer_service.service.CartService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CartController.class)
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CartService cartService;

    @Autowired
    private ObjectMapper objectMapper;

    private CartItemResponse cartItemResponse;

    @BeforeEach
    void setUp() {
        cartItemResponse = new CartItemResponse();
        cartItemResponse.setCartItemId(1L);
        cartItemResponse.setVariantId(10L);
        cartItemResponse.setQuantity(2);
    }

    @Test
    @WithMockUser
    @DisplayName("Add to Cart")
    void addToCart() throws Exception {
        AddToCartRequest request = new AddToCartRequest();
        request.setVariantId(10L);
        request.setQuantity(2);

        Mockito.when(cartService.addToCart(eq(1L), any(AddToCartRequest.class))).thenReturn(cartItemResponse);

        mockMvc.perform(post("/cart/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.data.variantId").value(10));
    }

    @Test
    @WithMockUser
    @DisplayName("Get Cart Items")
    void getCartItems() throws Exception {
        Mockito.when(cartService.getCartItems(1L)).thenReturn(Arrays.asList(cartItemResponse));

        mockMvc.perform(get("/cart/1/items")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.data[0].variantId").value(10));
    }

    @Test
    @WithMockUser
    @DisplayName("Get Cart Summary")
    void getCartSummary() throws Exception {
        CartSummaryResponse summary = new CartSummaryResponse();
        summary.setTotalItems(2);
        summary.setTotalAmount(new java.math.BigDecimal("500.00"));

        Mockito.when(cartService.getCartSummary(1L)).thenReturn(summary);

        mockMvc.perform(get("/cart/1/summary")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.data.totalItems").value(2));
    }

    @Test
    @WithMockUser
    @DisplayName("Update Cart Item")
    void updateCartItem() throws Exception {
        UpdateCartItemRequest request = new UpdateCartItemRequest();
        request.setQuantity(5);

        CartItemResponse updatedResponse = new CartItemResponse();
        updatedResponse.setCartItemId(1L);
        updatedResponse.setQuantity(5);

        Mockito.when(cartService.updateCartItem(eq(1L), eq(100L), any(UpdateCartItemRequest.class)))
                .thenReturn(updatedResponse);

        mockMvc.perform(put("/cart/1/items/100")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.data.quantity").value(5));
    }

    @Test
    @WithMockUser
    @DisplayName("Remove Cart Item")
    void removeCartItem() throws Exception {
        doNothing().when(cartService).removeCartItem(1L, 100L);

        mockMvc.perform(delete("/cart/1/items/100")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.message").value("Đã xóa sản phẩm khỏi giỏ hàng"));
    }

    @Test
    @WithMockUser
    @DisplayName("Clear Cart")
    void clearCart() throws Exception {
        doNothing().when(cartService).clearCart(1L);

        mockMvc.perform(delete("/cart/1/clear")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.message").value("Đã xóa toàn bộ giỏ hàng"));
    }

    @Test
    @WithMockUser
    @DisplayName("Get Cart Item Count")
    void getCartItemCount() throws Exception {
        Mockito.when(cartService.getCartItemCountByProfileId("prof-1")).thenReturn(5L);

        mockMvc.perform(get("/cart/prof-1/count")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("1000"))
                .andExpect(jsonPath("$.data").value(5));
    }
}
