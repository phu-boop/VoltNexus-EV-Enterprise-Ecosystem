package com.ev.inventory_service.controller;

import com.ev.common_lib.dto.inventory.AllocationRequestDto;
import com.ev.common_lib.dto.inventory.ShipmentRequestDto;
import com.ev.common_lib.dto.inventory.InventoryComparisonDto;
import com.ev.common_lib.dto.inventory.DetailedInventoryRequest;
import com.ev.common_lib.dto.inventory.VinValidationResultDto;
import com.ev.common_lib.dto.respond.ApiRespond;

import com.ev.inventory_service.dto.request.TransactionRequestDto;
import com.ev.inventory_service.dto.request.UpdateReorderLevelRequest;
import com.ev.inventory_service.dto.response.InventoryStatusDto;
import com.ev.inventory_service.dto.response.DealerInventoryDto;
import com.ev.inventory_service.model.InventoryTransaction;
import com.ev.inventory_service.services.Interface.InventoryService;
import com.ev.inventory_service.dto.request.CreateTransferRequestDto;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.time.LocalDate;
import java.util.UUID;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({ "/inventory", "" })
@RequiredArgsConstructor
@Slf4j
public class InventoryController {

    private final InventoryService inventoryService;

    // ==========================================================
    // ENDPOINTS FOR INVENTORY STATUS (TỒN KHO)
    // ==========================================================

    /**
     * Lấy danh sách tồn kho phân trang (cho kho trung tâm).
     * EVM Staff có thể lọc theo dealerId để xem xe của đại lý đó.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')")
    public ResponseEntity<ApiRespond<Page<InventoryStatusDto>>> getAllInventory(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID dealerId,
            @RequestParam(required = false) String status,
            Pageable pageable) {

        Page<InventoryStatusDto> results = inventoryService.getAllInventory(search, dealerId, status, pageable);
        return ResponseEntity.ok(ApiRespond.success("Fetched inventory successfully", results));
    }

    /**
     * Lấy trạng thái tồn kho chi tiết cho một phiên bản xe cụ thể (kho trung tâm).
     */
    @GetMapping("/{variantId}")
    public ResponseEntity<ApiRespond<InventoryStatusDto>> getInventoryStatusForVariant(@PathVariable Long variantId) {
        InventoryStatusDto status = inventoryService.getInventoryStatusForVariant(variantId);
        return ResponseEntity.ok(ApiRespond.success("Fetched inventory status for variant successfully", status));
    }

    /**
     * API MỚI: Dành cho Đại lý (Dealer) xem tồn kho của chính họ.
     * Tự động lọc dựa trên profileId (dealerId) của người dùng.
     */
    @GetMapping("/my-stock")
    @PreAuthorize("hasAnyRole('DEALER_MANAGER', 'DEALER_STAFF')")
    public ResponseEntity<ApiRespond<List<DealerInventoryDto>>> getMyInventory(
            @RequestHeader(value = "X-User-DealerId", required = false) UUID dealerIdHeader,
            @RequestHeader(value = "X-User-ProfileId", required = false) UUID profileIdHeader,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(required = false) String search) {

        // Ưu tiên dùng DealerId (ID tổ chức đại lý), fallback sang ProfileId
        UUID dealerId = (dealerIdHeader != null) ? dealerIdHeader : profileIdHeader;

        log.info("My Stock Access: X-User-DealerId={} | X-User-ProfileId={} | Using dealerId={}",
                dealerIdHeader, profileIdHeader, dealerId);

        // Tạo một đối tượng HttpHeaders để chuyển tiếp xác thực
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Email", email);
        headers.set("X-User-Role", role);
        headers.set("X-User-Id", userId);
        if (dealerId != null) {
            headers.set("X-User-DealerId", dealerId.toString());
        }

        List<DealerInventoryDto> results = inventoryService.getDealerInventory(dealerId, search, headers);
        return ResponseEntity.ok(ApiRespond.success("Fetched dealer inventory", results));
    }

    /**
     * API MỚI: Lấy trạng thái tồn kho chi tiết cho việc so sánh (cả kho TT và kho
     * đại lý).
     * Được gọi bởi Vehicle-Service.
     */
    @PostMapping("/status-by-ids-detailed")
    // Cho phép tất cả các dịch vụ nội bộ đã xác thực gọi
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiRespond<List<InventoryComparisonDto>>> getDetailedInventoryStatus(
            @RequestBody DetailedInventoryRequest request) {

        // Lấy thông số từ body
        List<Long> variantIds = request.getVariantIds();
        UUID dealerId = request.getDealerId();

        // Gọi service để lấy dữ liệu
        List<InventoryComparisonDto> results = inventoryService.getDetailedInventoryByIds(variantIds, dealerId);

        return ResponseEntity.ok(ApiRespond.success("Fetched detailed inventory status", results));
    }

    // ==========================================================
    // ENDPOINTS FOR TRANSACTIONS (GIAO DỊCH KHO)
    // ==========================================================

    /**
     * Thực hiện một giao dịch kho (NHẬP KHO, ĐIỀU CHUYỂN).
     * Được gọi bởi EVM Staff hoặc các service nội bộ (ví dụ: SalesService).
     */
    @PostMapping("/transactions")
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')")
    public ResponseEntity<ApiRespond<Void>> executeTransaction(
            @Valid @RequestBody TransactionRequestDto request,
            @RequestHeader("X-User-Email") String email,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-ProfileId") String profileId) {

        inventoryService.executeTransaction(request, email, role, profileId);
        return ResponseEntity.ok(ApiRespond.success("Transaction executed successfully", null));
    }

    /**
     * Lấy lịch sử tất cả các giao dịch kho, có phân trang và lọc theo ngày.
     */
    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')")
    public ResponseEntity<ApiRespond<Page<InventoryTransaction>>> getTransactionHistory(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Pageable pageable) {

        Page<InventoryTransaction> history = inventoryService.getTransactionHistory(startDate, endDate, pageable);
        return ResponseEntity.ok(ApiRespond.success("Fetched transaction history", history));
    }

    /**
     * API MỚI: Lấy trạng thái tồn kho cho một danh sách các variantId.
     * Nhận một mảng JSON các ID trong body.
     */
    @PostMapping("/status-by-ids")
    public ResponseEntity<ApiRespond<List<InventoryStatusDto>>> getInventoryStatusByIds(
            @RequestBody List<Long> variantIds) {

        List<InventoryStatusDto> results = inventoryService.getInventoryStatusByIds(variantIds);
        return ResponseEntity
                .ok(ApiRespond.success("Fetched inventory status for " + results.size() + " items", results));
    }

    /**
     * Lấy danh sách các variantId (ID sản phẩm) dựa trên trạng thái kho
     * (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)
     */
    @GetMapping("/variants/ids-by-status")
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')") // Đảm bảo an toàn
    public ResponseEntity<ApiRespond<List<Long>>> getVariantIdsByStatus(
            @RequestParam("status") String status) {

        List<Long> variantIds = inventoryService.getVariantIdsByStatus(status);
        return ResponseEntity.ok(ApiRespond.success("Fetched variant IDs by status", variantIds));
    }

    // ==========================================================
    // ENDPOINTS FOR B2B ORDER LIFECYCLE (ĐIỀU PHỐI ĐƠN HÀNG)
    // ==========================================================

    /**
     * Phân bổ (giữ chỗ) hàng trong kho trung tâm cho một đơn hàng B2B.
     * Được gọi bởi SalesService khi đơn hàng được duyệt (approve).
     */
    @PostMapping("/allocate")
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')")
    public ResponseEntity<ApiRespond<Void>> allocateStock(
            @Valid @RequestBody AllocationRequestDto request,
            @RequestHeader("X-User-Email") String email) {

        inventoryService.allocateStockForOrder(request, email);
        return ResponseEntity.ok(ApiRespond.success("Stock allocated successfully", null));
    }

    /**
     * Xuất kho (giao hàng) cho một đơn hàng B2B đã được phân bổ.
     * Cập nhật trạng thái xe theo VIN và di chuyển số lượng từ kho TT sang kho đại
     * lý.
     */
    @PostMapping("/ship-b2b")
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')")
    public ResponseEntity<ApiRespond<Void>> shipB2BOrder(
            @Valid @RequestBody ShipmentRequestDto request,
            @RequestHeader("X-User-Email") String email) {

        inventoryService.shipAllocatedStock(request, email);
        return ResponseEntity.ok(ApiRespond.success("Stock shipped successfully", null));
    }

    /**
     * Dùng để tạo yêu cầu điều chuyển (chờ duyệt).
     */
    @PostMapping("/transfer-requests")
    public ResponseEntity<ApiRespond<Void>> createTransferRequest(
            @Valid @RequestBody CreateTransferRequestDto request) {

        inventoryService.createTransferRequest(request);
        return ResponseEntity.ok(ApiRespond.success("Transfer request created successfully", null));
    }

    /**
     * API Chỉ kiểm tra VINs (read-only)
     */
    @PostMapping("/vehicles/validate-vins")
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')")
    public ResponseEntity<ApiRespond<VinValidationResultDto>> validateVins(
            @RequestBody List<String> vins) {

        // Gọi service
        VinValidationResultDto result = inventoryService.validateVinsForShipment(vins);

        // Trả về kết quả
        return ResponseEntity.ok(
                ApiRespond.success("VINs validated successfully.", result));
    }

    @GetMapping("/vehicles/available-vins")
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')")
    public ResponseEntity<ApiRespond<List<String>>> getAvailableVins(
            @RequestParam Long variantId) {

        List<String> vins = inventoryService.getAvailableVinsForVariant(variantId);
        return ResponseEntity.ok(
                ApiRespond.success("Fetched available VINs", vins));
    }

    // ==========================================================
    // ENDPOINTS FOR CONFIGURATION (CẤU HÌNH)
    // ==========================================================

    /**
     * Endpoint cho phép EVM Staff cập nhật ngưỡng cảnh báo tồn kho trung tâm.
     */
    @PutMapping("/central-stock/reorder-level")
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')")
    public ResponseEntity<ApiRespond<Void>> updateCentralReorderLevel(
            @Valid @RequestBody UpdateReorderLevelRequest request,
            @RequestHeader("X-User-Email") String email) {

        inventoryService.updateCentralReorderLevel(request, email);
        return ResponseEntity.ok(ApiRespond.success("Central reorder level updated successfully", null));
    }

    /**
     * Endpoint cho phép Đại lý tự cập nhật ngưỡng cảnh báo tồn kho.
     * (Lưu ý: API này được gọi bởi vai trò DEALER, không phải EVM_STAFF)
     */
    @PutMapping("/dealer-stock/reorder-level")
    @PreAuthorize("hasAnyRole('DEALER_MANAGER')")
    public ResponseEntity<ApiRespond<Void>> updateDealerReorderLevel(
            @Valid @RequestBody UpdateReorderLevelRequest request,
            @RequestHeader("X-User-ProfileId") UUID dealerId) {

        inventoryService.updateDealerReorderLevel(dealerId, request);
        return ResponseEntity.ok(ApiRespond.success("Reorder level updated successfully", null));
    }

    /**
     * Nhận yêu cầu phân bổ đồng bộ từ SalesService.
     * Sẽ ném lỗi (vd: INSUFFICIENT_STOCK) nếu thất bại.
     */
    @PostMapping("/allocate-sync")
    public ResponseEntity<ApiRespond<Void>> allocateStockSync(@RequestBody AllocationRequestDto request) {

        // Lấy email/role từ SecurityContext (giống như trong các hàm khác của bạn)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String staffEmail = authentication.getName();

        // Gọi hàm service 'allocateStockForOrder' mà bạn đã có sẵn
        inventoryService.allocateStockForOrder(request, staffEmail);

        return ResponseEntity.ok(ApiRespond.success("Phân bổ kho thành công (Sync)", null));
    }

    // ==========================================================
    // ENDPOINTS FOR REPORTING (BÁO CÁO)
    // ==========================================================

    /**
     * Xuất báo cáo tồn kho (giao dịch) ra file Excel hoặc PDF.
     */
    @GetMapping("/report/export")
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')")
    public void exportInventoryReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "xlsx") String format,
            HttpServletResponse response) throws IOException {

        if ("pdf".equalsIgnoreCase(format)) {
            response.setContentType("application/pdf");
            String headerValue = "attachment; filename=inventory_report_" + startDate + "_to_" + endDate + ".pdf";
            response.setHeader("Content-Disposition", headerValue);
            inventoryService.generatePdfReport(response.getOutputStream(), startDate, endDate);
        } else {
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            String headerValue = "attachment; filename=inventory_report_" + startDate + "_to_" + endDate + ".xlsx";
            response.setHeader("Content-Disposition", headerValue);
            inventoryService.generateInventoryReport(response.getOutputStream(), startDate, endDate);
        }
    }

    // ==========================================================
    // ===== ENDPOINT MỚI CHO VIỆC TRẢ HÀNG (KHIẾU NẠI) =====
    // ==========================================================

    /**
     * Nhận yêu cầu trả hàng (hủy phân bổ/hủy giao) từ SalesService
     * khi một đơn hàng DISPUTED được giải quyết.
     */
    @PostMapping("/return-by-order")
    @PreAuthorize("hasAnyRole('ADMIN','EVM_STAFF')") // Đảm bảo chỉ service (hoặc staff) mới được gọi
    public ResponseEntity<ApiRespond<Void>> returnStockByOrder(
            @RequestBody Map<String, UUID> payload,
            @RequestHeader("X-User-Email") String staffEmail) {

        UUID orderId = payload.get("orderId");
        if (orderId == null) {
            // Ném lỗi 400 nếu payload không chứa orderId
            throw new com.ev.common_lib.exception.AppException(
                    com.ev.common_lib.exception.ErrorCode.BAD_REQUEST);
        }

        inventoryService.returnStockForOrder(orderId, staffEmail);

        return ResponseEntity.ok(ApiRespond.success("Hàng đã được trả về kho (Sync)", null));
    }

    // ==========================================================
    // ============= FOR AI SERVICE ANALYTICS ===================
    // ==========================================================

    /**
     * Lấy inventory snapshots cho AI forecasting
     * API này được gọi từ AI Service để lấy dữ liệu tồn kho
     */
    @GetMapping("/analytics/snapshots")
    public ResponseEntity<ApiRespond<List<DealerInventoryDto>>> getInventorySnapshots(
            @RequestParam(required = false) Long variantId,
            @RequestParam(required = false) UUID dealerId,
            @RequestParam(defaultValue = "100") int limit) {

        List<DealerInventoryDto> snapshots = inventoryService.getInventorySnapshotsForAnalytics(
                variantId, dealerId, limit);

        return ResponseEntity.ok(
                ApiRespond.success("Inventory snapshots retrieved for AI Service", snapshots));
    }
}