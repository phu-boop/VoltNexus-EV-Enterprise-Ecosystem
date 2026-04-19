// Đây là lớp logic để chuyển đổi từ SalesOrder (Entity) sang SalesOrderDto (DTO).
package com.ev.sales_service.mapper;

import com.ev.sales_service.dto.response.SalesOrderDtoB2B;
import com.ev.sales_service.entity.OrderItem;
import com.ev.sales_service.entity.OrderTracking;
import com.ev.sales_service.entity.SalesContract;
import com.ev.sales_service.entity.SalesOrder;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class SalesOrderMapperB2B {

    // Hàm chính để chuyển đổi
    public SalesOrderDtoB2B toDto(SalesOrder order) {
        if (order == null) {
            return null;
        }

        SalesOrderDtoB2B dto = new SalesOrderDtoB2B();
        dto.setOrderId(order.getOrderId());
        dto.setDealerId(order.getDealerId());
        dto.setCustomerId(order.getCustomerId());
        dto.setStaffId(order.getStaffId());
        dto.setOrderDate(order.getOrderDate());
        dto.setDeliveryDate(order.getDeliveryDate());
        dto.setOrderStatus(order.getOrderStatus()); // B2B status
        dto.setOrderStatusB2C(order.getOrderStatusB2C()); // B2C status (có thể null)
        dto.setPaymentStatus(order.getPaymentStatus()); // Payment status
        dto.setTypeOder(order.getTypeOder()); // B2B hoặc B2C
        dto.setTotalAmount(order.getTotalAmount());
        dto.setManagerApproval(order.getManagerApproval());
        dto.setApprovedBy(order.getApprovedBy());
        dto.setApprovalDate(order.getApprovalDate());

        // Map danh sách con
        if (order.getOrderItems() != null) {
            dto.setOrderItems(
                order.getOrderItems().stream()
                    .map(this::toOrderItemDto)
                    .collect(Collectors.toList())
            );
        } else {
            dto.setOrderItems(Collections.emptyList());
        }
        
        if (order.getOrderTrackings() != null) {
            dto.setOrderTrackings(
                order.getOrderTrackings().stream()
                    .map(this::toOrderTrackingDto)
                    .collect(Collectors.toList())
            );
        } else {
            dto.setOrderTrackings(Collections.emptyList());
        }

        if (order.getSalesContract() != null) {
            dto.setContractInfo(toContractInfoInOrderDto(order.getSalesContract()));
        }

        return dto;
    }

    // --- Các hàm helper để map các đối tượng con ---

    private SalesOrderDtoB2B.OrderItemDto toOrderItemDto(OrderItem item) {
        if (item == null) return null;
        SalesOrderDtoB2B.OrderItemDto dto = new SalesOrderDtoB2B.OrderItemDto();
        dto.setOrderItemId(item.getOrderItemId());
        dto.setVariantId(item.getVariantId()); 
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setDiscount(item.getDiscount());
        dto.setFinalPrice(item.getFinalPrice());
        return dto;
    }

    private SalesOrderDtoB2B.OrderTrackingDto toOrderTrackingDto(OrderTracking tracking) {
        if (tracking == null) return null;
        SalesOrderDtoB2B.OrderTrackingDto dto = new SalesOrderDtoB2B.OrderTrackingDto();
        dto.setTrackId(tracking.getTrackId());
        dto.setStatus(tracking.getStatus());
        dto.setUpdateDate(tracking.getUpdateDate());
        dto.setNotes(tracking.getNotes());
        dto.setUpdatedBy(tracking.getUpdatedBy());
        return dto;
    }

    private SalesOrderDtoB2B.ContractInfoInOrderDto toContractInfoInOrderDto(SalesContract contract) {
        if (contract == null) return null;
        SalesOrderDtoB2B.ContractInfoInOrderDto dto = new SalesOrderDtoB2B.ContractInfoInOrderDto();
        dto.setContractId(contract.getContractId());
        dto.setContractDate(contract.getContractDate());
        dto.setContractStatus(contract.getContractStatus());
        dto.setContractFileUrl(contract.getContractFileUrl());
        return dto;
    }
}
