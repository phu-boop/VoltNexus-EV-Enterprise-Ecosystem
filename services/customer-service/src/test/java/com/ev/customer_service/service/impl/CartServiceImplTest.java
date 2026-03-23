package com.ev.customer_service.service.impl;

import com.ev.common_lib.exception.AppException;
import com.ev.customer_service.dto.request.AddToCartRequest;
import com.ev.customer_service.dto.request.UpdateCartItemRequest;
import com.ev.customer_service.dto.response.CartItemResponse;
import com.ev.customer_service.dto.response.CartSummaryResponse;
import com.ev.customer_service.entity.CartItem;
import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.repository.CartItemRepository;
import com.ev.customer_service.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CartServiceImpl using Mockito.
 * No Spring context / DB required → runs fast on CI and contributes to JaCoCo
 * coverage.
 */
@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CartServiceImpl cartService;

    // ── Fixtures ─────────────────────────────────────────────────────────────

    private Customer customer;
    private CartItem cartItem;
    private AddToCartRequest addRequest;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setCustomerId(1L);
        customer.setFirstName("Nguyen");
        customer.setLastName("Van A");
        customer.setEmail("nva@example.com");

        addRequest = new AddToCartRequest(
                101L, // variantId
                2, // quantity
                "VoltRide X1", // vehicleName
                "Midnight Black",
                "https://img.example.com/x1.jpg",
                new BigDecimal("750000000"),
                null,
                null);

        cartItem = CartItem.builder()
                .cartItemId(10L)
                .customer(customer)
                .variantId(101L)
                .quantity(2)
                .vehicleName("VoltRide X1")
                .vehicleColor("Midnight Black")
                .vehicleImageUrl("https://img.example.com/x1.jpg")
                .unitPrice(new BigDecimal("750000000"))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // ══════════════════════════════════════════════════════════════════════════
    // addToCart
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("addToCart()")
    class AddToCart {

        @Test
        @DisplayName("Thêm item mới vào giỏ hàng thành công")
        void addNewItem_success() {
            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            when(cartItemRepository.findByCustomerCustomerIdAndVariantId(1L, 101L))
                    .thenReturn(Optional.empty());
            when(cartItemRepository.save(any(CartItem.class))).thenReturn(cartItem);

            CartItemResponse result = cartService.addToCart(1L, addRequest);

            assertThat(result).isNotNull();
            assertThat(result.getVariantId()).isEqualTo(101L);
            assertThat(result.getQuantity()).isEqualTo(2);
            verify(cartItemRepository).save(any(CartItem.class));
        }

        @Test
        @DisplayName("Thêm item đã tồn tại → tăng quantity")
        void addExistingItem_incrementsQuantity() {
            CartItem existing = CartItem.builder()
                    .cartItemId(10L)
                    .customer(customer)
                    .variantId(101L)
                    .quantity(3)
                    .unitPrice(new BigDecimal("750000000"))
                    .build();

            when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
            when(cartItemRepository.findByCustomerCustomerIdAndVariantId(1L, 101L))
                    .thenReturn(Optional.of(existing));

            CartItem updated = CartItem.builder()
                    .cartItemId(10L)
                    .customer(customer)
                    .variantId(101L)
                    .quantity(5) // 3 + 2
                    .unitPrice(new BigDecimal("750000000"))
                    .build();
            when(cartItemRepository.save(any(CartItem.class))).thenReturn(updated);

            CartItemResponse result = cartService.addToCart(1L, addRequest);

            assertThat(result.getQuantity()).isEqualTo(5);
        }

        @Test
        @DisplayName("Customer không tồn tại → ném AppException")
        void addToCart_customerNotFound_throwsException() {
            when(customerRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cartService.addToCart(99L, addRequest))
                    .isInstanceOf(AppException.class);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // getCartItems
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getCartItems()")
    class GetCartItems {

        @Test
        @DisplayName("Trả về danh sách items thành công")
        void getCartItems_returnsItems() {
            when(cartItemRepository.findByCustomerCustomerIdOrderByCreatedAtDesc(1L))
                    .thenReturn(List.of(cartItem));

            List<CartItemResponse> items = cartService.getCartItems(1L);

            assertThat(items).hasSize(1);
            assertThat(items.get(0).getVariantId()).isEqualTo(101L);
        }

        @Test
        @DisplayName("Giỏ hàng trống → trả về list rỗng")
        void getCartItems_emptyCart_returnsEmptyList() {
            when(cartItemRepository.findByCustomerCustomerIdOrderByCreatedAtDesc(1L))
                    .thenReturn(List.of());

            List<CartItemResponse> items = cartService.getCartItems(1L);

            assertThat(items).isEmpty();
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // getCartSummary
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getCartSummary()")
    class GetCartSummary {

        @Test
        @DisplayName("Tính đúng tổng tiền và VAT 10%")
        void getCartSummary_calculatesCorrectTotals() {
            // price = 750_000_000 * 2 = 1_500_000_000
            when(cartItemRepository.findByCustomerCustomerIdOrderByCreatedAtDesc(1L))
                    .thenReturn(List.of(cartItem));

            CartSummaryResponse summary = cartService.getCartSummary(1L);

            BigDecimal expected = new BigDecimal("1500000000");
            assertThat(summary.getTotalAmount()).isEqualByComparingTo(expected);
            assertThat(summary.getEstimatedTax())
                    .isEqualByComparingTo(expected.multiply(new BigDecimal("0.10")));
            assertThat(summary.getTotalItems()).isEqualTo(1);
        }

        @Test
        @DisplayName("Giỏ hàng rỗng → tổng tiền bằng 0")
        void getCartSummary_emptyCart_returnsZeroTotal() {
            when(cartItemRepository.findByCustomerCustomerIdOrderByCreatedAtDesc(1L))
                    .thenReturn(List.of());

            CartSummaryResponse summary = cartService.getCartSummary(1L);

            assertThat(summary.getTotalAmount()).isEqualByComparingTo(BigDecimal.ZERO);
            assertThat(summary.getTotalItems()).isZero();
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // updateCartItem
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("updateCartItem()")
    class UpdateCartItem {

        @Test
        @DisplayName("Cập nhật quantity thành công")
        void updateCartItem_success() {
            UpdateCartItemRequest req = new UpdateCartItemRequest(5, "[1,2,3]", "giao nhanh");

            when(cartItemRepository.findById(10L)).thenReturn(Optional.of(cartItem));
            when(cartItemRepository.save(any(CartItem.class))).thenReturn(cartItem);

            CartItemResponse result = cartService.updateCartItem(1L, 10L, req);

            assertThat(result).isNotNull();
            verify(cartItemRepository).save(cartItem);
        }

        @Test
        @DisplayName("Cart item không tìm thấy → ném AppException")
        void updateCartItem_notFound_throwsException() {
            when(cartItemRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cartService.updateCartItem(1L, 99L, new UpdateCartItemRequest(2, null, null)))
                    .isInstanceOf(AppException.class);
        }

        @Test
        @DisplayName("Cart item không thuộc customer → ném AppException (unauthorized)")
        void updateCartItem_wrongOwner_throwsException() {
            when(cartItemRepository.findById(10L)).thenReturn(Optional.of(cartItem));

            // customerId = 999 ≠ cartItem.customer.customerId = 1
            assertThatThrownBy(() -> cartService.updateCartItem(999L, 10L, new UpdateCartItemRequest(2, null, null)))
                    .isInstanceOf(AppException.class);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // removeCartItem
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("removeCartItem()")
    class RemoveCartItem {

        @Test
        @DisplayName("Xóa item thành công")
        void removeCartItem_success() {
            when(cartItemRepository.findById(10L)).thenReturn(Optional.of(cartItem));

            cartService.removeCartItem(1L, 10L);

            verify(cartItemRepository).delete(cartItem);
        }

        @Test
        @DisplayName("Item không tồn tại → ném AppException")
        void removeCartItem_notFound_throwsException() {
            when(cartItemRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> cartService.removeCartItem(1L, 99L))
                    .isInstanceOf(AppException.class);
        }

        @Test
        @DisplayName("Xóa item của customer khác → ném AppException")
        void removeCartItem_wrongOwner_throwsException() {
            when(cartItemRepository.findById(10L)).thenReturn(Optional.of(cartItem));

            assertThatThrownBy(() -> cartService.removeCartItem(999L, 10L))
                    .isInstanceOf(AppException.class);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // clearCart
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("clearCart()")
    class ClearCart {

        @Test
        @DisplayName("Xóa toàn bộ giỏ hàng thành công")
        void clearCart_success() {
            when(customerRepository.existsById(1L)).thenReturn(true);

            cartService.clearCart(1L);

            verify(cartItemRepository).deleteByCustomerCustomerId(1L);
        }

        @Test
        @DisplayName("Customer không tồn tại → ném AppException")
        void clearCart_customerNotFound_throwsException() {
            when(customerRepository.existsById(99L)).thenReturn(false);

            assertThatThrownBy(() -> cartService.clearCart(99L))
                    .isInstanceOf(AppException.class);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // getCartItemCount
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getCartItemCount()")
    class GetCartItemCount {

        @Test
        @DisplayName("Trả về số lượng items đúng")
        void getCartItemCount_returnsCorrectCount() {
            when(cartItemRepository.countByCustomerId(1L)).thenReturn(3L);

            Long count = cartService.getCartItemCount(1L);

            assertThat(count).isEqualTo(3L);
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // getCartItemCountByProfileId
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("getCartItemCountByProfileId()")
    class GetCartItemCountByProfileId {

        @Test
        @DisplayName("Customer tồn tại → trả về số items")
        void getCountByProfileId_customerExists() {
            when(customerRepository.findByProfileId("profile-uuid-123"))
                    .thenReturn(Optional.of(customer));
            when(cartItemRepository.countByCustomerId(1L)).thenReturn(4L);

            Long count = cartService.getCartItemCountByProfileId("profile-uuid-123");

            assertThat(count).isEqualTo(4L);
        }

        @Test
        @DisplayName("Customer chưa tồn tại → trả về 0")
        void getCountByProfileId_customerNotFound_returnsZero() {
            when(customerRepository.findByProfileId("unknown-profile"))
                    .thenReturn(Optional.empty());

            Long count = cartService.getCartItemCountByProfileId("unknown-profile");

            assertThat(count).isZero();
            verify(cartItemRepository, never()).countByCustomerId(any());
        }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // CartItem.getTotalPrice() — pure logic, không cần mock
    // ══════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("CartItem.getTotalPrice()")
    class CartItemTotalPrice {

        @Test
        @DisplayName("Tính đúng tổng giá = unitPrice × quantity")
        void getTotalPrice_calculatesCorrectly() {
            CartItem item = CartItem.builder()
                    .unitPrice(new BigDecimal("500000"))
                    .quantity(3)
                    .build();

            assertThat(item.getTotalPrice()).isEqualByComparingTo(new BigDecimal("1500000"));
        }

        @Test
        @DisplayName("unitPrice null → trả về 0")
        void getTotalPrice_nullUnitPrice_returnsZero() {
            CartItem item = CartItem.builder().quantity(2).build();
            assertThat(item.getTotalPrice()).isEqualByComparingTo(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("quantity null → trả về 0")
        void getTotalPrice_nullQuantity_returnsZero() {
            CartItem item = CartItem.builder().unitPrice(new BigDecimal("300000")).build();
            assertThat(item.getTotalPrice()).isEqualByComparingTo(BigDecimal.ZERO);
        }
    }
}
