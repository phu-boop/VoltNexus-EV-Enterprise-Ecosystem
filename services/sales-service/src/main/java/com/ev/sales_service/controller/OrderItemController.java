package com.ev.sales_service.controller;

import com.ev.sales_service.dto.request.OrderItemRequest;
import com.ev.sales_service.dto.response.OrderItemResponse;
import com.ev.sales_service.service.Interface.OrderItemService;
import com.ev.common_lib.dto.respond.ApiRespond;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/order-items")
@RequiredArgsConstructor
@Slf4j
public class OrderItemController {

    private final OrderItemService orderItemService;

    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_MANAGER', 'DEALER_STAFF')")
    @PostMapping
    public ResponseEntity<ApiRespond<OrderItemResponse>> createOrderItem(@RequestBody OrderItemRequest request) {
        log.info("Creating order item for order: {}", request.getOrderId());
        OrderItemResponse response = orderItemService.createOrderItem(request);
        return ResponseEntity.ok(ApiRespond.success("Order item created successfully", response));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_MANAGER', 'DEALER_STAFF')")
    @PutMapping("/{orderItemId}")
    public ResponseEntity<ApiRespond<OrderItemResponse>> updateOrderItem(
            @PathVariable UUID orderItemId,
            @RequestBody OrderItemRequest request) {
        log.info("Updating order item: {}", orderItemId);
        OrderItemResponse response = orderItemService.updateOrderItem(orderItemId, request);
        return ResponseEntity.ok(ApiRespond.success("Order item updated successfully", response));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_MANAGER', 'DEALER_STAFF')")
    @DeleteMapping("/{orderItemId}")
    public ResponseEntity<ApiRespond<Void>> deleteOrderItem(@PathVariable UUID orderItemId) {
        log.info("Deleting order item: {}", orderItemId);
        orderItemService.deleteOrderItem(orderItemId);
        return ResponseEntity.ok(ApiRespond.success("Order item deleted successfully", null));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER', 'DEALER_STAFF', 'CUSTOMER')")
    @GetMapping("/{orderItemId}")
    public ResponseEntity<ApiRespond<OrderItemResponse>> getOrderItemById(@PathVariable UUID orderItemId) {
        log.info("Fetching order item: {}", orderItemId);
        OrderItemResponse response = orderItemService.getOrderItemById(orderItemId);
        return ResponseEntity.ok(ApiRespond.success("Order item fetched successfully", response));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF', 'DEALER_MANAGER', 'DEALER_STAFF', 'CUSTOMER')")
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiRespond<List<OrderItemResponse>>> getOrderItemsByOrderId(@PathVariable UUID orderId) {
        log.info("Fetching order items for order: {}", orderId);
        List<OrderItemResponse> responses = orderItemService.getOrderItemsByOrderId(orderId);
        return ResponseEntity.ok(ApiRespond.success("Order items fetched successfully", responses));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_MANAGER', 'DEALER_STAFF')")
    @PutMapping("/order/{orderId}/bulk")
    public ResponseEntity<ApiRespond<List<OrderItemResponse>>> updateOrderItems(
            @PathVariable UUID orderId,
            @RequestBody List<OrderItemRequest> orderItems) {
        log.info("Updating all order items for order: {}", orderId);
        List<OrderItemResponse> responses = orderItemService.updateOrderItems(orderId, orderItems);
        return ResponseEntity.ok(ApiRespond.success("Order items updated successfully", responses));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER_MANAGER', 'DEALER_STAFF')")
    @PostMapping("/validate")
    public ResponseEntity<ApiRespond<Void>> validateOrderItems(@RequestBody List<OrderItemRequest> orderItems) {
        log.info("Validating order items");
        orderItemService.validateOrderItems(orderItems);
        return ResponseEntity.ok(ApiRespond.success("Order items validated successfully", null));
    }
}