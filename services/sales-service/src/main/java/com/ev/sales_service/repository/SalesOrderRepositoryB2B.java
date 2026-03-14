package com.ev.sales_service.repository;

import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.enums.OrderStatusB2B;
import com.ev.sales_service.enums.SaleOderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Page; 
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;
import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface SalesOrderRepositoryB2B extends JpaRepository<SalesOrder, UUID>, JpaSpecificationExecutor<SalesOrder> {
    /**
     * Tìm tất cả đơn hàng theo trạng thái, có phân trang.
     */
    Page<SalesOrder> findAllByOrderStatus(OrderStatusB2B status, Pageable pageable);

    /**
     * Tìm tất cả đơn hàng của một đại lý cụ thể (có phân trang)
     */
    Page<SalesOrder> findAllByDealerId(UUID dealerId, Pageable pageable);

    /**
     * Tìm tất cả đơn hàng của một đại lý VÀ lọc theo trạng thái
     */
    Page<SalesOrder> findAllByDealerIdAndOrderStatus(UUID dealerId, OrderStatusB2B status, Pageable pageable);

     /**
     * Tìm tất cả đơn hàng của một đại lý VÀ lọc theo kieeu B2B hay B2C
     */
    Optional<SalesOrder> findByOrderIdAndTypeOder(UUID orderId, SaleOderType typeOder);

     // Lấy tất cả đơn B2B || B2C với trạng thái cụ thể cos phan trang
    Page<SalesOrder> findAllByTypeOderAndOrderStatus(SaleOderType typeOder, OrderStatusB2B orderStatus, Pageable pageable);

    // Lấy tất cả đơn B2B || B2C khong phan trang
    Page<SalesOrder> findAllByTypeOder(SaleOderType typeOder, Pageable pageable);

    // Lấy tất cả đơn B2B || B2C  của dealer với status
    Page<SalesOrder> findAllByDealerIdAndTypeOderAndOrderStatus(UUID dealerId, SaleOderType typeOder, OrderStatusB2B orderStatus, Pageable pageable);

    // Lấy tất cả đơn B2B || B2C  của dealer mà không cần filter status
    Page<SalesOrder> findAllByDealerIdAndTypeOder(UUID dealerId, SaleOderType typeOder, Pageable pageable);
    
    List<SalesOrder> findAllByOrderStatusAndDeliveryDateBetween(
        OrderStatusB2B status, 
        LocalDateTime startDate, 
        LocalDateTime endDate
    );

    // Lấy danh sách đơn hàng B2B || B2C với trạng thái cụ thể
    List<SalesOrder> findAllByTypeOderAndOrderStatus(SaleOderType typeOder, OrderStatusB2B orderStatus);
    
    // ==================== FOR AI SERVICE ====================
    /**
     * Lấy orders theo khoảng thời gian (cho AI forecasting)
     */
    List<SalesOrder> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Lấy orders theo dealer và thời gian
     */
    List<SalesOrder> findByDealerIdAndOrderDateBetween(UUID dealerId, LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Lấy orders theo variant ID (thông qua order items)
     */
    @Query(
        "SELECT DISTINCT o FROM SalesOrder o JOIN o.orderItems oi " +
        "WHERE oi.variantId = :variantId AND o.orderDate BETWEEN :startDate AND :endDate"
    )
    List<SalesOrder> findByVariantIdAndDateRange(
        @Param("variantId") Long variantId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}
