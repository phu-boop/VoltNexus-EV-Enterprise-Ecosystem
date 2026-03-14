package com.ev.sales_service.service.Interface;


import com.ev.sales_service.dto.request.OrderItemRequest;
import com.ev.sales_service.dto.response.OrderItemResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface OrderItemService {
    OrderItemResponse createOrderItem(OrderItemRequest request);

    OrderItemResponse updateOrderItem(UUID orderItemId, OrderItemRequest request);

    void deleteOrderItem(UUID orderItemId);

    OrderItemResponse getOrderItemById(UUID orderItemId);

    List<OrderItemResponse> getOrderItemsByOrderId(UUID orderId);

    List<OrderItemResponse> updateOrderItems(UUID orderId, List<OrderItemRequest> orderItems);

    void validateOrderItems(List<OrderItemRequest> orderItems);

    BigDecimal calculateOrderTotal(UUID orderId);
}
