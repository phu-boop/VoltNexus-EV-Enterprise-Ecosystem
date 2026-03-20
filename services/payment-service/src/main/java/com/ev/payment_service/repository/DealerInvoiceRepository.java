package com.ev.payment_service.repository;

import com.ev.payment_service.entity.DealerInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DealerInvoiceRepository extends JpaRepository<DealerInvoice, UUID> {

    // Lấy tất cả hóa đơn của một Đại lý (có phân trang)
    Page<DealerInvoice> findByDealerId(UUID dealerId, Pageable pageable);

    // Lấy các hóa đơn của Đại lý theo trạng thái (có phân trang)
    Page<DealerInvoice> findByDealerIdAndStatus(UUID dealerId, String status, Pageable pageable);

    // Lấy tất cả hóa đơn theo trạng thái (cho EVM Staff) - có phân trang
    Page<DealerInvoice> findByStatus(String status, Pageable pageable);

    // Kiểm tra xem order đã có hóa đơn chưa (dựa vào referenceId)
    @Query("SELECT di FROM DealerInvoice di WHERE di.referenceType = 'SALES_ORDER_B2B' AND di.referenceId = :orderId")
    Optional<DealerInvoice> findByOrderId(@Param("orderId") String orderId);

    // Lấy danh sách hóa đơn theo orderId (có thể có nhiều hóa đơn cho 1 order)
    @Query("SELECT di FROM DealerInvoice di WHERE di.referenceType = 'SALES_ORDER_B2B' AND di.referenceId = :orderId")
    List<DealerInvoice> findAllByOrderId(@Param("orderId") String orderId);
}