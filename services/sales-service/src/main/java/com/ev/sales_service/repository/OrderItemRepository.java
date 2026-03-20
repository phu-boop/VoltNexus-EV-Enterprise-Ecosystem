package com.ev.sales_service.repository;

import com.ev.sales_service.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    List<OrderItem> findBySalesOrder_OrderId(UUID orderId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.salesOrder.orderId = :orderId AND oi.variantId = :variantId")
    List<OrderItem> findByOrderIdAndVariantId(@Param("orderId") UUID orderId, @Param("variantId") Long variantId);

    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.variantId = :variantId")
    Long getTotalOrderedQuantityByVariantId(@Param("variantId") Long variantId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.salesOrder.orderId IN :orderIds")
    List<OrderItem> findByOrderIds(@Param("orderIds") List<UUID> orderIds);

    boolean existsByVariantIdAndSalesOrder_OrderId(Long variantId, UUID orderId);
}