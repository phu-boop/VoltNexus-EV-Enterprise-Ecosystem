package com.ev.sales_service.service.Implementation;

import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.sales_service.dto.request.OrderItemRequest;
import com.ev.sales_service.dto.response.OrderItemResponse;
import com.ev.sales_service.entity.OrderItem;
import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.enums.OrderStatusB2C;
import com.ev.sales_service.repository.OrderItemRepository;
import com.ev.sales_service.repository.SalesOrderRepositoryB2C;
import com.ev.sales_service.service.Interface.OrderItemService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.PrintStream;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class OrderItemServiceImpl implements OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final SalesOrderRepositoryB2C salesOrderRepository;
    private final ModelMapper modelMapper;

    @Override
    public OrderItemResponse createOrderItem(OrderItemRequest request) {
        log.info("Creating order item for order: {}", request.getOrderId());

        SalesOrder salesOrder = salesOrderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));
        // validate if saleOrder calculated

        if (salesOrder.getOrderStatusB2C() != (OrderStatusB2C.PENDING)) {
            throw new AppException(ErrorCode.ORDER_ITEM_OPERATION_INVALID_STATE);
        }
        ;
        // Validate if variant already exists in order
        if (orderItemRepository.existsByVariantIdAndSalesOrder_OrderId(request.getVariantId(), request.getOrderId())) {
            throw new AppException(ErrorCode.ORDER_ITEM_ALREADY_EXISTS);
        }

        OrderItem orderItem = OrderItem.builder()
                .salesOrder(salesOrder)
                .variantId(request.getVariantId())
                .quantity(request.getQuantity())
                .unitPrice(request.getUnitPrice())
                .discount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO)
                .finalPrice(calculateFinalPrice(request.getUnitPrice(), request.getQuantity(),
                        request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO))
                .build();

        OrderItem savedItem = orderItemRepository.save(orderItem);
        log.info("Order item created successfully: {}", savedItem.getOrderItemId());

        return mapToResponse(savedItem);
    }

    @Override
    public OrderItemResponse updateOrderItem(UUID orderItemId, OrderItemRequest request) {
        log.info("Updating order item: {}", orderItemId);

        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_ITEM_NOT_FOUND));

        // Update fields
        orderItem.setVariantId(request.getVariantId());
        orderItem.setQuantity(request.getQuantity());
        orderItem.setUnitPrice(request.getUnitPrice());
        orderItem.setDiscount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO);
        orderItem.setFinalPrice(calculateFinalPrice(request.getUnitPrice(), request.getQuantity(),
                request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO));

        SalesOrder salesOrder = salesOrderRepository.findById(orderItem.getSalesOrder().getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));
        if (salesOrder.getOrderStatusB2C()!=(OrderStatusB2C.PENDING)) {
            throw new AppException(ErrorCode.ORDER_ITEM_OPERATION_INVALID_STATE);
        }
        ;
        OrderItem updatedItem = orderItemRepository.save(orderItem);
        log.info("Order item updated successfully: {}", orderItemId);

        return mapToResponse(updatedItem);
    }

    @Override
    public void deleteOrderItem(UUID orderItemId) {
        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_ITEM_NOT_FOUND));

        log.info("Deleting order item: {}", orderItemId);
        SalesOrder salesOrder = salesOrderRepository.findById(orderItem.getSalesOrder().getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));
        if (!salesOrder.getOrderStatusB2C().equals(OrderStatusB2C.PENDING)) {
            throw new AppException(ErrorCode.ORDER_ITEM_OPERATION_INVALID_STATE);
        }
        ;
        orderItemRepository.delete(orderItem);
        log.info("Order item deleted successfully: {}", orderItemId);
    }

    @Override
    public OrderItemResponse getOrderItemById(UUID orderItemId) {
        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_ITEM_NOT_FOUND));
        return mapToResponse(orderItem);
    }

    @Override
    public List<OrderItemResponse> getOrderItemsByOrderId(UUID orderId) {
        List<OrderItem> orderItems = orderItemRepository.findBySalesOrder_OrderId(orderId);
        return orderItems.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderItemResponse> updateOrderItems(UUID orderId, List<OrderItemRequest> orderItems) {
        log.info("Updating all order items for order: {}", orderId);

        // Delete existing items
        List<OrderItem> existingItems = orderItemRepository.findBySalesOrder_OrderId(orderId);
        orderItemRepository.deleteAll(existingItems);

        // Create new items
        SalesOrder salesOrder = salesOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.SALES_ORDER_NOT_FOUND));
        if (!salesOrder.getOrderStatusB2C().equals(OrderStatusB2C.PENDING)) {
            throw new AppException(ErrorCode.ORDER_ITEM_OPERATION_INVALID_STATE);
        }
        ;
        List<OrderItem> newItems = orderItems.stream()
                .map(request -> OrderItem.builder()
                        .salesOrder(salesOrder)
                        .variantId(request.getVariantId())
                        .quantity(request.getQuantity())
                        .unitPrice(request.getUnitPrice())
                        .discount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO)
                        .finalPrice(calculateFinalPrice(request.getUnitPrice(), request.getQuantity(),
                                request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO))
                        .build())
                .collect(Collectors.toList());

        List<OrderItem> savedItems = orderItemRepository.saveAll(newItems);
        log.info("Updated {} order items for order: {}", savedItems.size(), orderId);

        return savedItems.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void validateOrderItems(List<OrderItemRequest> orderItems) {
        if (orderItems == null || orderItems.isEmpty()) {
            throw new AppException(ErrorCode.ORDER_ITEMS_REQUIRED);
        }

        for (OrderItemRequest item : orderItems) {
            if (item.getVariantId() == null) {
                throw new AppException(ErrorCode.VARIANT_ID_REQUIRED);
            }
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new AppException(ErrorCode.INVALID_QUANTITY);
            }
            if (item.getUnitPrice() == null || item.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new AppException(ErrorCode.INVALID_UNIT_PRICE);
            }
        }
    }

    @Override
    public BigDecimal calculateOrderTotal(UUID orderId) {
        List<OrderItem> orderItems = orderItemRepository.findBySalesOrder_OrderId(orderId);
        return orderItems.stream()
                .map(OrderItem::getFinalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateFinalPrice(BigDecimal unitPrice, Integer quantity, BigDecimal discount) {
        BigDecimal total = unitPrice.multiply(BigDecimal.valueOf(quantity));
        BigDecimal discountAmount = total.multiply(discount.divide(BigDecimal.valueOf(100)));
        return total.subtract(discountAmount);
    }

    private OrderItemResponse mapToResponse(OrderItem orderItem) {
        OrderItemResponse response = modelMapper.map(orderItem, OrderItemResponse.class);
        // TODO: Add variant details from inventory service
        return response;
    }
}