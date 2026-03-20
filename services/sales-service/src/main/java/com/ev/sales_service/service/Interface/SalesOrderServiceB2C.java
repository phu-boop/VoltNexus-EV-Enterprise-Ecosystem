package com.ev.sales_service.service.Interface;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.sales_service.dto.request.CreateOrderFromDepositRequest;
import com.ev.sales_service.dto.request.OrderItemRequest;
import com.ev.sales_service.dto.request.SalesOrderB2CCreateRequest;
import com.ev.sales_service.dto.response.SalesContractResponse;
import com.ev.sales_service.dto.response.SalesOrderB2CResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface SalesOrderServiceB2C {
    SalesOrderB2CResponse createSalesOrderFromQuotation(UUID quotationId);

    SalesOrderB2CResponse createOrderFromBookingDeposit(CreateOrderFromDepositRequest request);

    SalesOrderB2CResponse createSalesOrder(SalesOrderB2CCreateRequest request);

    SalesOrderB2CResponse getSalesOrderById(UUID orderId);

    List<SalesOrderB2CResponse> getSalesOrdersByDealer(UUID dealerId);

    List<SalesOrderB2CResponse> getSalesOrdersByCustomer(Long customerId);
    
    List<SalesOrderB2CResponse> getSalesOrdersByProfileId(String profileId);

    SalesOrderB2CResponse updateSalesOrderStatus(UUID orderId, String status);

    SalesOrderB2CResponse approveSalesOrder(UUID orderId, UUID managerId);

    Long getModelIdBySalesOrderId(UUID salesOrderId);

    // Thêm vào SalesOrderServiceB2C interface
    SalesOrderB2CResponse addOrderItemsToSalesOrder(UUID orderId);

    SalesOrderB2CResponse rejectSalesOrder(UUID orderId, String reason);

    SalesContractResponse convertToContract(UUID orderId);

    SalesOrderB2CResponse convertToComplete(UUID orderId);

    void handleCustomerOrderConfirmation(UUID orderId, boolean confirmed);

    SalesOrderB2CResponse markOrderAsEdited(UUID orderId, UUID staffId);

    /**
     * Admin/Staff lấy tất cả đơn hàng B2C với phân trang và filter theo status
     * 
     * @param status   Filter theo status (optional, null = lấy tất cả)
     * @param pageable Pagination parameters
     * @return Page of B2C orders
     */
    Page<SalesOrderB2CResponse> getAllB2COrders(String status, Pageable pageable);

    /**
     * Lấy tất cả đơn hàng cho mục đích báo cáo/sync (Internal)
     * @param since Optional: Fetch orders modified/created after this date
     */
    List<SalesOrderB2CResponse> getAllSalesForReporting(java.time.LocalDateTime since);
}