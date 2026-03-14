package com.ev.customer_service.service.impl;

import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.customer_service.dto.request.AddToCartRequest;
import com.ev.customer_service.dto.request.UpdateCartItemRequest;
import com.ev.customer_service.dto.response.CartItemResponse;
import com.ev.customer_service.dto.response.CartSummaryResponse;
import com.ev.customer_service.entity.CartItem;
import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.repository.CartItemRepository;
import com.ev.customer_service.repository.CustomerRepository;
import com.ev.customer_service.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final CustomerRepository customerRepository;

    @Override
    public CartItemResponse addToCart(Long customerId, AddToCartRequest request) {
        log.info("Adding variant {} to cart for customer {}", request.getVariantId(), customerId);

        // Find customer
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepository
                .findByCustomerCustomerIdAndVariantId(customerId, request.getVariantId());

        CartItem cartItem;
        if (existingItem.isPresent()) {
            // Update quantity if item exists
            cartItem = existingItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());

            // Update other fields if provided
            if (request.getSelectedFeatures() != null) {
                cartItem.setSelectedFeatures(request.getSelectedFeatures());
            }
            if (request.getNotes() != null) {
                cartItem.setNotes(request.getNotes());
            }

            log.info("Updated existing cart item, new quantity: {}", cartItem.getQuantity());
        } else {
            // Create new cart item
            cartItem = CartItem.builder()
                    .customer(customer)
                    .variantId(request.getVariantId())
                    .quantity(request.getQuantity())
                    .vehicleName(request.getVehicleName())
                    .vehicleColor(request.getVehicleColor())
                    .vehicleImageUrl(request.getVehicleImageUrl())
                    .unitPrice(request.getUnitPrice())
                    .selectedFeatures(request.getSelectedFeatures())
                    .notes(request.getNotes())
                    .build();

            log.info("Created new cart item");
        }

        CartItem savedItem = cartItemRepository.save(cartItem);
        return mapToResponse(savedItem);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CartItemResponse> getCartItems(Long customerId) {
        log.info("Getting cart items for customer {}", customerId);

        List<CartItem> cartItems = cartItemRepository.findByCustomerCustomerIdOrderByCreatedAtDesc(customerId);
        return cartItems.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CartSummaryResponse getCartSummary(Long customerId) {
        log.info("Getting cart summary for customer {}", customerId);

        List<CartItem> cartItems = cartItemRepository.findByCustomerCustomerIdOrderByCreatedAtDesc(customerId);

        List<CartItemResponse> itemResponses = cartItems.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        BigDecimal totalAmount = cartItems.stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate 10% VAT
        BigDecimal tax = totalAmount.multiply(new BigDecimal("0.10"));
        BigDecimal estimatedTotal = totalAmount.add(tax);

        return CartSummaryResponse.builder()
                .customerId(customerId)
                .items(itemResponses)
                .totalItems(cartItems.size())
                .totalAmount(totalAmount)
                .estimatedTax(tax)
                .estimatedTotal(estimatedTotal)
                .build();
    }

    @Override
    public CartItemResponse updateCartItem(Long customerId, Long cartItemId, UpdateCartItemRequest request) {
        log.info("Updating cart item {} for customer {}", cartItemId, customerId);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        // Verify ownership
        if (!cartItem.getCustomer().getCustomerId().equals(customerId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Update fields
        cartItem.setQuantity(request.getQuantity());

        if (request.getSelectedFeatures() != null) {
            cartItem.setSelectedFeatures(request.getSelectedFeatures());
        }
        if (request.getNotes() != null) {
            cartItem.setNotes(request.getNotes());
        }

        CartItem updatedItem = cartItemRepository.save(cartItem);
        return mapToResponse(updatedItem);
    }

    @Override
    public void removeCartItem(Long customerId, Long cartItemId) {
        log.info("Removing cart item {} for customer {}", cartItemId, customerId);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        // Verify ownership
        if (!cartItem.getCustomer().getCustomerId().equals(customerId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        cartItemRepository.delete(cartItem);
        log.info("Cart item removed successfully");
    }

    @Override
    public void clearCart(Long customerId) {
        log.info("Clearing cart for customer {}", customerId);

        // Verify customer exists
        if (!customerRepository.existsById(customerId)) {
            throw new AppException(ErrorCode.CUSTOMER_NOT_FOUND);
        }

        cartItemRepository.deleteByCustomerCustomerId(customerId);
        log.info("Cart cleared successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public Long getCartItemCount(Long customerId) {
        return cartItemRepository.countByCustomerId(customerId);
    }

    /**
     * Map CartItem entity to CartItemResponse DTO
     */
    private CartItemResponse mapToResponse(CartItem cartItem) {
        return CartItemResponse.builder()
                .cartItemId(cartItem.getCartItemId())
                .customerId(cartItem.getCustomer().getCustomerId())
                .variantId(cartItem.getVariantId())
                .quantity(cartItem.getQuantity())
                .vehicleName(cartItem.getVehicleName())
                .vehicleColor(cartItem.getVehicleColor())
                .vehicleImageUrl(cartItem.getVehicleImageUrl())
                .unitPrice(cartItem.getUnitPrice())
                .totalPrice(cartItem.getTotalPrice())
                .selectedFeatures(cartItem.getSelectedFeatures())
                .notes(cartItem.getNotes())
                .createdAt(cartItem.getCreatedAt())
                .updatedAt(cartItem.getUpdatedAt())
                .build();
    }

    @Override
    public Long getCartItemCountByProfileId(String profileId) {
        log.info("Getting cart item count for profile {}", profileId);

        // Find customer by profileId
        Optional<Customer> customerOpt = customerRepository.findByProfileId(profileId);

        // If customer doesn't exist yet, return 0 (cart is empty)
        if (customerOpt.isEmpty()) {
            log.info("Customer not found for profile {}, returning 0", profileId);
            return 0L;
        }

        return getCartItemCount(customerOpt.get().getCustomerId());
    }
}
