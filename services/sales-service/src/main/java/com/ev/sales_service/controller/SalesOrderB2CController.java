package com.ev.sales_service.controller;

import com.ev.sales_service.dto.request.CreateOrderFromDepositRequest;
import com.ev.sales_service.dto.request.OrderItemRequest;
import com.ev.sales_service.dto.response.SalesContractResponse;
import com.ev.sales_service.dto.response.SalesOrderB2CResponse;
import com.ev.sales_service.service.Interface.SalesOrderServiceB2C;
import com.ev.common_lib.dto.respond.ApiRespond;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sales-orders")
@RequiredArgsConstructor
@Slf4j
public class SalesOrderB2CController {

    private final SalesOrderServiceB2C salesOrderServiceB2C;

    /**
     * Admin/Staff lấy tất cả đơn hàng B2C với phân trang
     * GET /api/v1/sales-orders/b2c?status=PENDING&page=0&size=10
     */
    @GetMapping("/b2c")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<ApiRespond<Page<SalesOrderB2CResponse>>> getAllB2COrders(
            @RequestParam(value = "status", required = false) String status,
            @PageableDefault(size = 10, sort = "orderDate") Pageable pageable) {

        log.info("Fetching all B2C sales orders with status: {} and pageable: {}", status, pageable);
        Page<SalesOrderB2CResponse> orderPage = salesOrderServiceB2C.getAllB2COrders(status, pageable);
        return ResponseEntity.ok(ApiRespond.success("Lấy danh sách đơn hàng B2C thành công", orderPage));
    }

    @GetMapping("/internal/all-for-reporting")
    public ResponseEntity<List<SalesOrderB2CResponse>> getAllSalesForReporting(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime since) {
        log.info("Fetching sales orders for reporting sync since: {}", since);
        return ResponseEntity.ok(salesOrderServiceB2C.getAllSalesForReporting(since));
    }

    @PostMapping("/b2c/from-quotation/{quotationId}")
    public ResponseEntity<ApiRespond<SalesOrderB2CResponse>> createSalesOrderFromQuotation(
            @PathVariable UUID quotationId) {
        log.info("Converting quotation to B2C sales order: {}", quotationId);
        SalesOrderB2CResponse response = salesOrderServiceB2C.createSalesOrderFromQuotation(quotationId);
        return ResponseEntity.ok(ApiRespond.success("Sales order created successfully", response));
    }

    /**
     * Admin tạo đơn hàng từ booking deposit
     * POST /api/v1/sales-orders/admin/from-booking-deposit
     */
    @PostMapping("/admin/from-booking-deposit")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<ApiRespond<SalesOrderB2CResponse>> createOrderFromBookingDeposit(
            @RequestBody @Valid CreateOrderFromDepositRequest request) {
        log.info("Creating sales order from booking deposit - RecordId: {}", request.getRecordId());
        SalesOrderB2CResponse response = salesOrderServiceB2C.createOrderFromBookingDeposit(request);
        return ResponseEntity.ok(ApiRespond.success("Tạo đơn hàng từ booking deposit thành công", response));
    }

    /**
     * Internal endpoint - Payment Service tự động gọi sau khi thanh toán thành công
     * POST /api/v1/sales-orders/internal/from-booking-deposit
     * Không yêu cầu xác thực (chỉ gọi nội bộ giữa các service)
     */
    @PostMapping("/internal/from-booking-deposit")
    public ResponseEntity<ApiRespond<SalesOrderB2CResponse>> internalCreateOrderFromBookingDeposit(
            @RequestBody @Valid CreateOrderFromDepositRequest request) {
        log.info("[INTERNAL] Auto-creating sales order from successful payment - RecordId: {}", request.getRecordId());
        SalesOrderB2CResponse response = salesOrderServiceB2C.createOrderFromBookingDeposit(request);
        return ResponseEntity.ok(ApiRespond.success("Create order after payment succesfully", response));
    }

    @GetMapping("/b2c/{orderId}")
    public ResponseEntity<ApiRespond<SalesOrderB2CResponse>> getSalesOrderById(@PathVariable UUID orderId) {
        log.info("Fetching B2C sales order by ID: {}", orderId);
        SalesOrderB2CResponse response = salesOrderServiceB2C.getSalesOrderById(orderId);
        return ResponseEntity.ok(ApiRespond.success("Sales order fetched successfully", response));
    }

    @GetMapping("/b2c/dealer/{dealerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    public ResponseEntity<ApiRespond<List<SalesOrderB2CResponse>>> getSalesOrdersByDealer(@PathVariable UUID dealerId) {
        log.info("Fetching B2C sales orders for dealer (Admin view): {}", dealerId);
        List<SalesOrderB2CResponse> responses = salesOrderServiceB2C.getSalesOrdersByDealer(dealerId);
        return ResponseEntity.ok(ApiRespond.success("Sales orders fetched successfully", responses));
    }

    @GetMapping("/b2c/my-sales")
    @PreAuthorize("hasAnyRole('DEALER_MANAGER', 'DEALER_STAFF')")
    public ResponseEntity<ApiRespond<List<SalesOrderB2CResponse>>> getMySalesOrders(
            @RequestHeader("X-User-ProfileId") UUID dealerId) {
        log.info("Fetching B2C sales orders for 'my' dealer: {}", dealerId);
        List<SalesOrderB2CResponse> responses = salesOrderServiceB2C.getSalesOrdersByDealer(dealerId);
        return ResponseEntity.ok(ApiRespond.success("My sales orders fetched successfully", responses));
    }

    @GetMapping("/b2c/customer/{customerId}")
    public ResponseEntity<ApiRespond<List<SalesOrderB2CResponse>>> getSalesOrdersByCustomer(
            @PathVariable Long customerId) {
        log.info("Fetching B2C sales orders for customer: {}", customerId);
        List<SalesOrderB2CResponse> responses = salesOrderServiceB2C.getSalesOrdersByCustomer(customerId);
        return ResponseEntity.ok(ApiRespond.success("Sales orders fetched successfully", responses));
    }
    
    @GetMapping("/b2c/profile/{profileId}")
    public ResponseEntity<ApiRespond<List<SalesOrderB2CResponse>>> getSalesOrdersByProfileId(
            @PathVariable String profileId) {
        log.info("Fetching B2C sales orders for profile: {}", profileId);
        List<SalesOrderB2CResponse> responses = salesOrderServiceB2C.getSalesOrdersByProfileId(profileId);
        return ResponseEntity.ok(ApiRespond.success("Sales orders fetched successfully", responses));
    }

    @PutMapping("/b2c/{orderId}/status")
    public ResponseEntity<ApiRespond<SalesOrderB2CResponse>> updateSalesOrderStatus(
            @PathVariable UUID orderId,
            @RequestParam String status) {
        log.info("Updating B2C sales order status: {} to {}", orderId, status);
        SalesOrderB2CResponse response = salesOrderServiceB2C.updateSalesOrderStatus(orderId, status);
        return ResponseEntity.ok(ApiRespond.success("Sales order status updated successfully", response));
    }

    @PutMapping("/b2c/{orderId}/approve")
    public ResponseEntity<ApiRespond<SalesOrderB2CResponse>> approveSalesOrder(
            @PathVariable UUID orderId,
            @RequestParam UUID managerId) {
        log.info("Approving B2C sales order: {} by manager: {}", orderId, managerId);
        SalesOrderB2CResponse response = salesOrderServiceB2C.approveSalesOrder(orderId, managerId);
        return ResponseEntity.ok(ApiRespond.success("Sales order approved successfully", response));
    }

    @GetMapping("/b2c/{orderId}/model-id")
    public ResponseEntity<Long> getModelIdBySalesOrderId(@PathVariable UUID orderId) {
        Long modelId = salesOrderServiceB2C.getModelIdBySalesOrderId(orderId);
        return ResponseEntity.ok(modelId);
    }

    @PutMapping("/b2c/{orderId}/order-items")
    public ResponseEntity<ApiRespond<SalesOrderB2CResponse>> addOrderItemsToSalesOrder(
            @PathVariable UUID orderId) {
        log.info("Recalculating/adding order items for B2C sales order: {}", orderId);
        SalesOrderB2CResponse response = salesOrderServiceB2C.addOrderItemsToSalesOrder(orderId);
        return ResponseEntity.ok(ApiRespond.success("Order items recalculated successfully", response));
    }

    /**
     * ✅ Manager hoặc khách hàng từ chối đơn hàng (APPROVED → REJECTED)
     */
    @PostMapping("/{orderId}/reject")
    public ApiRespond<SalesOrderB2CResponse> rejectOrder(
            @PathVariable UUID orderId,
            @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        SalesOrderB2CResponse response = salesOrderServiceB2C.rejectSalesOrder(orderId, reason);
        return ApiRespond.success("Order rejected successfully", response);
    }

    @PostMapping("/b2c/{orderId}/convert-to-contract")
    public ResponseEntity<ApiRespond<SalesContractResponse>> convertToContract(
            @PathVariable UUID orderId) {

        log.info("Converting SalesOrder [{}] to contract...", orderId);

        // Service đã xử lý tất cả kiểm tra lỗi theo ErrorCode
        SalesContractResponse response = salesOrderServiceB2C.convertToContract(orderId);

        // Trả về ApiRespond với message và data
        return ResponseEntity.ok(
                ApiRespond.success("Tạo hợp đồng thành công từ đơn hàng đã xác nhận", response));
    }

    @PostMapping("/b2c/{orderId}/complete")
    public ResponseEntity<ApiRespond<SalesOrderB2CResponse>> convertToComplete(
            @PathVariable UUID orderId) {

        // Service đã xử lý tất cả kiểm tra lỗi theo ErrorCode
        SalesOrderB2CResponse response = salesOrderServiceB2C.convertToComplete(orderId);

        // Trả về ApiRespond với message và data
        return ResponseEntity.ok(
                ApiRespond.success("Tạo hợp đồng thành công từ đơn hàng đã xác nhận", response));
    }

    @PutMapping("/b2c/{orderId}/mark-edited")
    public ResponseEntity<ApiRespond<SalesOrderB2CResponse>> markOrderAsEdited(
            @PathVariable UUID orderId,
            @RequestParam UUID staffId) {
        log.info("Marking B2C sales order {} as EDITED by staff {}", orderId, staffId);
        SalesOrderB2CResponse response = salesOrderServiceB2C.markOrderAsEdited(orderId, staffId);
        return ResponseEntity.ok(ApiRespond.success("Sales order marked as EDITED successfully", response));
    }

}