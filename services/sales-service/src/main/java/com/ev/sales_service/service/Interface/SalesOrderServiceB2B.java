package com.ev.sales_service.service.Interface;

import com.ev.common_lib.dto.inventory.ShipmentRequestDto;
import com.ev.sales_service.dto.request.CreateB2BOrderRequest;
import com.ev.sales_service.dto.request.ReportIssueRequest;
import com.ev.sales_service.dto.request.ResolveDisputeRequest;
import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.enums.OrderStatusB2B;
import com.ev.sales_service.enums.PaymentStatus;
import java.util.UUID;
import java.util.List;
import java.time.LocalDate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SalesOrderServiceB2B {

    /**
     * Luồng B2B: Đại lý tạo một đơn hàng mới (Trạng thái PENDING).
     */
    SalesOrder createB2BOrder(CreateB2BOrderRequest request, String email, UUID dealerId);

    /**
     * Luồng B2B: EVM Staff/Admin duyệt đơn hàng (Trạng thái CONFIRMED).
     * Sẽ kích hoạt logic gọi sang Inventory-Service để giữ hàng.
     */
    SalesOrder approveB2BOrder(UUID orderId, String email);

    /**
     * Luồng B2B: EVM Staff/Admin xác nhận giao hàng (Trạng thái IN_TRANSIT).
     * Sẽ kích hoạt logic gọi sang Inventory-Service để chuyển kho.
     */
    SalesOrder shipB2BOrder(UUID orderId, ShipmentRequestDto shipmentRequest, String email);
    
    /**
     * Luồng B2B: Đại lý xác nhận đã nhận hàng (Trạng thái DELIVERED).
     */
    SalesOrder confirmDelivery(UUID orderId, String email, UUID dealerId);

    /**
     * Luồng B2B: EVM Staff/Admin lấy danh sách tất cả đơn hàng.
     * Hỗ trợ lọc theo trạng thái (nếu status = null, lấy tất cả) và phân trang.
     */
    Page<SalesOrder> getAllB2BOrders(OrderStatusB2B status, Pageable pageable);

    /**
     * Lấy danh sách đơn hàng B2B của một đại lý cụ thể (đại lý đang đăng nhập)
     */
    Page<SalesOrder> getMyB2BOrders(UUID dealerId, OrderStatusB2B status, Pageable pageable);

    /**
     * Hủy đơn hàng bởi Dealer Manager (chỉ hủy được đơn của chính họ khi PENDING).
     */
    void cancelOrderByDealer(UUID orderId, String email, UUID dealerId);

    /**
     * Hủy đơn hàng bởi Staff hoặc Admin (hủy được mọi đơn PENDING).
     */
    void cancelOrderByStaff(UUID orderId, String email);
    
    /**
     * Xóa đơn hàng B2B
     */
    void deleteCancelledOrder(UUID orderId);

    // Lấy đơn hàng giao thành công cho báo cáo
    List<SalesOrder> getCompletedOrdersForReport(LocalDate startDate, LocalDate endDate);

    /**
     * Đại lý báo cáo sự cố (giao thiếu, hỏng hóc) cho một đơn hàng.
     */
    void reportOrderIssue(UUID orderId, UUID dealerId, ReportIssueRequest request, String email);

    /**
     * Lấy chi tiết đơn hàng theo orderId
     */
    SalesOrder getOrderById(UUID orderId);

    /**
     * Giải quyết một đơn hàng đang bị khiếu nại (DISPUTED)
     */
    SalesOrder resolveOrderDispute(UUID orderId, String staffEmail, ResolveDisputeRequest request);

    /**
     * Lấy chi tiết đơn hàng B2B bằng ID
     */
    SalesOrder getB2BOrderDetailsById(UUID orderId);

    /**
     * Cập nhật trạng thái thanh toán của đơn hàng
     * Được gọi từ Payment Service sau khi tạo hóa đơn
     */
    void updatePaymentStatus(UUID orderId, PaymentStatus paymentStatus);
}
