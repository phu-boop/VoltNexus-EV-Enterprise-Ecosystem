package com.ev.sales_service.repository;

import com.ev.sales_service.entity.OrderTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface OrderTrackingRepository extends JpaRepository<OrderTracking, UUID> {

    List<OrderTracking> findBySalesOrder_OrderIdOrderByUpdateDateDesc(UUID orderId);

    @Query("SELECT ot FROM OrderTracking ot WHERE ot.salesOrder.orderId = :orderId AND ot.statusB2C = :status")
    List<OrderTracking> findByOrderIdAndStatusB2C(@Param("orderId") UUID orderId, @Param("status") String status);

    @Query("SELECT ot FROM OrderTracking ot WHERE ot.updateDate BETWEEN :startDate AND :endDate")
    List<OrderTracking> findByUpdateDateBetween(@Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);

    @Query("SELECT ot FROM OrderTracking ot WHERE ot.salesOrder.orderId = :orderId ORDER BY ot.updateDate DESC LIMIT 1")
    OrderTracking findLatestByOrderId(@Param("orderId") UUID orderId);

    @Query("SELECT COUNT(ot) FROM OrderTracking ot WHERE ot.salesOrder.orderId = :orderId")
    Long countByOrderId(@Param("orderId") UUID orderId);

    List<OrderTracking> findByUpdatedBy(UUID staffId);
}