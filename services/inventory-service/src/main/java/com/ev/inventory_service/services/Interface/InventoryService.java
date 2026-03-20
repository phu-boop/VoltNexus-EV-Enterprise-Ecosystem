package com.ev.inventory_service.services.Interface;

import com.ev.common_lib.dto.inventory.AllocationRequestDto;
import com.ev.common_lib.dto.inventory.ShipmentRequestDto;
import com.ev.common_lib.dto.inventory.InventoryComparisonDto;
import com.ev.common_lib.dto.inventory.VinValidationResultDto;

import com.ev.inventory_service.dto.request.TransactionRequestDto;
import com.ev.inventory_service.dto.request.UpdateReorderLevelRequest;
import com.ev.inventory_service.dto.request.CreateTransferRequestDto;
import com.ev.inventory_service.dto.response.InventoryStatusDto;
import com.ev.inventory_service.dto.response.DealerInventoryDto;
import com.ev.inventory_service.model.InventoryTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import java.io.OutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.util.UUID;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpHeaders;
// import java.time.LocalTime;
// import java.time.LocalDateTime;

public interface InventoryService {

    // Lấy trạng thái tồn kho chi tiết của một sản phẩm
    InventoryStatusDto getInventoryStatusForVariant(Long variantId);

    // Lấy tồn kho chi tiết của tất cả sản phẩm
    Page<InventoryStatusDto> getAllInventory(String search, UUID dealerId, String status, Pageable pageable);
    
    // Thực hiện một giao dịch kho (nhập kho)
    void executeTransaction(TransactionRequestDto request, String staffEmail, String role, String profileId);

    // Tạo điều phối
    void createTransferRequest(CreateTransferRequestDto request);
    
    // Cập nhật ngưỡng cảnh báo tồn kho cho đại lí
    void updateDealerReorderLevel(UUID dealerId, UpdateReorderLevelRequest request);

    // Cập nhật ngưỡng cảnh báo tồn kho cho hãng
    void updateCentralReorderLevel(UpdateReorderLevelRequest request, String updatedByEmail);
    
    // Xuất báo cáo tồn kho
    // Excel
    void generateInventoryReport(OutputStream outputStream, LocalDate startDate, LocalDate endDate) throws IOException;
    // PDF
    void generatePdfReport(OutputStream outputStream, LocalDate startDate, LocalDate endDate) throws IOException;

    // Lấy lịch sử giao dịch
    Page<InventoryTransaction> getTransactionHistory(LocalDate startDate,LocalDate endDate ,Pageable pageable);

    /**
     * Giữ (phân bổ) hàng trong kho trung tâm cho một đơn hàng.
     * Trừ 'availableQuantity' và cộng vào 'allocatedQuantity'.
     */
    void allocateStockForOrder(AllocationRequestDto request, String staffEmail);

    /**
     * Xuất kho B2B: Chuyển xe (bằng VIN) từ kho trung tâm sang kho đại lý.
     * Trừ 'allocatedQuantity' (kho TT), cập nhật trạng thái VIN, cộng vào 'dealer_inventory'.
     */
    @Transactional
    void shipAllocatedStock(ShipmentRequestDto request, String staffEmail);

    /**
     * Lấy trạng thái tồn kho cho một danh sách các variantId.
     */
    List<InventoryStatusDto> getInventoryStatusByIds(List<Long> variantIds);

    /**
     * Lấy tồn kho đã gộp thông tin chi tiết của một đại lý cụ thể.
     */
    List<DealerInventoryDto> getDealerInventory(UUID dealerId, String search, HttpHeaders headers);

    /**
     * Lấy thông tin tồn kho chi tiết (cả kho TT và kho đại lý) cho việc so sánh.
     */
    List<InventoryComparisonDto> getDetailedInventoryByIds(List<Long> variantIds, UUID dealerId);

    /**
     * Kiểm tra một danh sách VIN xem chúng có sẵn sàng để giao không.
     */
    VinValidationResultDto validateVinsForShipment(List<String> vins);

    // Lấy số VIN khả dụng trong kho
    List<String> getAvailableVinsForVariant(Long variantId);

    /**
     * Xử lý việc trả hàng về kho trung tâm khi một đơn hàng B2B bị
     * giải quyết khiếu nại (RETURNED_TO_CENTRAL).
     *
     * @param orderId ID của đơn hàng từ SalesService
     * @param staffEmail Email của nhân viên xử lý
     */
    void returnStockForOrder(UUID orderId, String staffEmail);

    /**
     * Lấy danh sách ID sản phẩm (variantId) dựa trên trạng thái kho.
     * @param status Chuỗi "IN_STOCK", "LOW_STOCK", hoặc "OUT_OF_STOCK"
     */
    List<Long> getVariantIdsByStatus(String status);

    /**
     * Lấy snapshot của inventory cho AI Service để phân tích và dự báo.
     * @param variantId ID của variant (tùy chọn)
     * @param dealerId ID của dealer (tùy chọn)
     * @param limit Số lượng bản ghi tối đa
     * @return Danh sách DealerInventoryDto chứa thông tin tồn kho
     */
    List<DealerInventoryDto> getInventorySnapshotsForAnalytics(Long variantId, UUID dealerId, int limit);
}
