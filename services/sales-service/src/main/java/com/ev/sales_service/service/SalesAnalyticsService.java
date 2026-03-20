package com.ev.sales_service.service;

import com.ev.sales_service.dto.SalesHistoryDto;
import com.ev.sales_service.entity.OrderItem;
import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.enums.OrderStatusB2B;
import com.ev.sales_service.enums.OrderStatusB2C;
import com.ev.sales_service.repository.SalesOrderRepositoryB2B;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SalesAnalyticsService {
    
    private final SalesOrderRepositoryB2B salesOrderRepository;
    
    /**
     * Lấy sales history cho AI forecasting
     */
    public List<SalesHistoryDto> getSalesHistory(
        Long variantId,
        UUID dealerId,
        String region,
        LocalDateTime startDate,
        LocalDateTime endDate,
        int limit
    ) {
        List<SalesOrder> orders;
        
        // Query orders theo filters
        if (variantId != null) {
            orders = salesOrderRepository.findByVariantIdAndDateRange(variantId, startDate, endDate);
        } else if (dealerId != null) {
            orders = salesOrderRepository.findByDealerIdAndOrderDateBetween(dealerId, startDate, endDate);
        } else {
            orders = salesOrderRepository.findByOrderDateBetween(startDate, endDate);
        }
        
        // Convert to DTOs
        List<SalesHistoryDto> history = new ArrayList<>();
        
        for (SalesOrder order : orders) {
            // Chỉ lấy orders đã COMPLETED
            if (!isOrderCompleted(order)) {
                continue;
            }
            
            if (order.getOrderItems() != null) {
                for (OrderItem item : order.getOrderItems()) {
                    // Filter by variantId if specified
                    if (variantId != null && !item.getVariantId().equals(variantId)) {
                        continue;
                    }
                    
                    SalesHistoryDto dto = SalesHistoryDto.builder()
                        .orderId(order.getOrderId())
                        .variantId(item.getVariantId())
                        .dealerId(order.getDealerId())
                        .region(region) // TODO: Get from dealer service
                        .quantity(item.getQuantity())
                        .totalAmount(item.getFinalPrice())
                        .unitPrice(item.getUnitPrice())
                        .orderDate(order.getOrderDate())
                        .orderStatus(getOrderStatus(order))
                        .modelName("Unknown") // TODO: Get from vehicle service
                        .variantName("Variant " + item.getVariantId())
                        .build();
                    
                    history.add(dto);
                    
                    if (history.size() >= limit) {
                        break;
                    }
                }
            }
            
            if (history.size() >= limit) {
                break;
            }
        }
        
        log.info("Found {} sales records", history.size());
        return history;
    }
    
    /**
     * Lấy sales summary group by variant
     */
    public List<SalesHistoryDto> getSalesSummaryByVariant(LocalDateTime startDate, LocalDateTime endDate) {
        List<SalesOrder> orders = salesOrderRepository.findByOrderDateBetween(startDate, endDate);
        
        // Group by variant and sum quantities
        return orders.stream()
            .filter(this::isOrderCompleted)
            .flatMap(order -> order.getOrderItems().stream())
            .collect(Collectors.groupingBy(
                OrderItem::getVariantId,
                Collectors.summingInt(OrderItem::getQuantity)
            ))
            .entrySet().stream()
            .map(entry -> SalesHistoryDto.builder()
                .variantId(entry.getKey())
                .quantity(entry.getValue())
                .orderDate(LocalDateTime.now())
                .build())
            .collect(Collectors.toList());
    }
    
    private boolean isOrderCompleted(SalesOrder order) {
        if (order.getOrderStatus() != null) {
            return order.getOrderStatus() == OrderStatusB2B.DELIVERED;
        }
        if (order.getOrderStatusB2C() != null) {
            return order.getOrderStatusB2C() == OrderStatusB2C.DELIVERED;
        }
        return false;
    }
    
    private String getOrderStatus(SalesOrder order) {
        if (order.getOrderStatus() != null) {
            return order.getOrderStatus().toString();
        }
        if (order.getOrderStatusB2C() != null) {
            return order.getOrderStatusB2C().toString();
        }
        return "UNKNOWN";
    }
}
