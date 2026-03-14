package com.ev.sales_service.repository;

import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.enums.OrderStatusB2C;
import com.ev.sales_service.enums.SaleOderType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SalesOrderRepositoryB2C extends JpaRepository<SalesOrder, UUID> {

    List<SalesOrder> findByDealerIdAndTypeOder(UUID dealerId, SaleOderType typeOder);

    List<SalesOrder> findByCustomerIdAndTypeOder(Long customerId, SaleOderType typeOder);

    List<SalesOrder> findByOrderStatusAndTypeOder(String orderStatus, SaleOderType typeOder);

    @Query("SELECT so FROM SalesOrder so WHERE so.orderDate BETWEEN :startDate AND :endDate AND so.typeOder = :typeOder")
    List<SalesOrder> findByOrderDateBetweenAndTypeOder(@Param("startDate") LocalDateTime startDate,
                                                      @Param("endDate") LocalDateTime endDate,
                                                      @Param("typeOder") SaleOderType typeOder);

    @Query("SELECT so FROM SalesOrder so WHERE so.dealerId = :dealerId AND so.typeOder = :typeOder AND so.orderStatus = :status")
    List<SalesOrder> findByDealerIdAndTypeOderAndStatus(@Param("dealerId") UUID dealerId,
                                                       @Param("typeOder") SaleOderType typeOder,
                                                       @Param("status") String status);

    // Phân trang cho Admin lấy tất cả đơn hàng B2C
    Page<SalesOrder> findByTypeOder(SaleOderType typeOder, Pageable pageable);

    // Phân trang với filter theo status
    Page<SalesOrder> findByTypeOderAndOrderStatusB2C(SaleOderType typeOder, OrderStatusB2C orderStatusB2C, Pageable pageable);
}