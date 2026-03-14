package com.example.reporting_service.controller;

import com.example.reporting_service.model.InventorySummaryByRegion;
import com.example.reporting_service.model.SalesSummaryByDealership;
import com.example.reporting_service.model.CentralInventorySummary;
import com.example.reporting_service.model.CentralInventoryTransactionLog;
import com.example.reporting_service.repository.InventorySummaryRepository;
import com.example.reporting_service.repository.SalesSummaryRepository;
import com.example.reporting_service.repository.CentralInventorySummaryRepository;
import com.example.reporting_service.repository.CentralInventoryTransactionLogRepository;
import com.example.reporting_service.service.ReportingService;
import com.example.reporting_service.dto.InventoryVelocityDTO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/reports") 
public class ReportController {

    @Autowired
    private InventorySummaryRepository inventoryRepository;

    @Autowired
    private SalesSummaryRepository salesRepository;

    @Autowired
    private ReportingService reportingService;

    @Autowired
    private CentralInventorySummaryRepository centralInventoryRepo;

    @Autowired
    private CentralInventoryTransactionLogRepository centralTransactionLogRepo;

    /**
     * API: GET /reports/inventory
     * Phục vụ task: "xem tồn kho theo mẫu xe, phiên bản và khu vực" (Có thể filter)
     */
    @GetMapping("/inventory")
    public ResponseEntity<List<InventorySummaryByRegion>> getInventoryReport(
        @RequestParam(required = false) String region,
        @RequestParam(required = false) String modelId,
        @RequestParam(required = false) String variantId
    ) {
        // Khởi tạo Specification để xây dựng truy vấn động (filter theo tham số)
        Specification<InventorySummaryByRegion> spec = (root, query, cb) -> cb.conjunction();

        if (region != null && !region.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("region"), region));
        }
        if (modelId != null && !modelId.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("modelId"), modelId));
        }
        if (variantId != null && !variantId.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("variantId"), variantId));
        }

        // Truy vấn dữ liệu đã được tổng hợp (pre-aggregated)
        List<InventorySummaryByRegion> results = inventoryRepository.findAll(spec);
        
        return ResponseEntity.ok(results);
    }

    /**
     * API: GET /reports/sales
     * Phục vụ task: "Doanh số theo khu vực, đại lý" (Có thể filter)
     */
    @GetMapping("/sales")
    public ResponseEntity<List<SalesSummaryByDealership>> getSalesReport(
        @RequestParam(required = false) String region,
        @RequestParam(required = false) Long dealershipId,
        @RequestParam(required = false) String modelId,
        @RequestParam(required = false) String variantId
    ) {
        // Tái sử dụng Specification y hệt như API inventory
        Specification<SalesSummaryByDealership> spec = (root, query, cb) -> cb.conjunction();

        if (region != null && !region.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("region"), region));
        }
        if (dealershipId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("dealershipId"), dealershipId));
        }
        if (modelId != null && !modelId.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("modelId"), modelId));
        }
        if (variantId != null && !variantId.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("variantId"), variantId));
        }

        // Truy vấn bảng doanh số
        List<SalesSummaryByDealership> results = salesRepository.findAll(spec);
        
        return ResponseEntity.ok(results);
    }

    /**
     * API: GET /reports/inventory-velocity
     * Phục vụ task: "Tồn kho & tốc độ tiêu thụ"
     */
    @GetMapping("/inventory-velocity")
    public ResponseEntity<List<InventoryVelocityDTO>> getInventoryVelocityReport(
        @RequestParam(required = false) String region,
        @RequestParam(required = false) String modelId,
        @RequestParam(required = false) String variantId
        // Lưu ý: Không filter theo dealershipId ở đây, 
        // vì chúng ta đang tính velocity theo Region (khớp với bảng Inventory)
    ) {
        
        // Tạo Specification cho Inventory (giống API /inventory)
        Specification<InventorySummaryByRegion> inventorySpec = (root, query, cb) -> cb.conjunction();
        if (region != null && !region.isEmpty()) {
            inventorySpec = inventorySpec.and((root, query, cb) -> cb.equal(root.get("region"), region));
        }
        if (modelId != null && !modelId.isEmpty()) {
            inventorySpec = inventorySpec.and((root, query, cb) -> cb.equal(root.get("modelId"), modelId));
        }
        if (variantId != null && !variantId.isEmpty()) {
            inventorySpec = inventorySpec.and((root, query, cb) -> cb.equal(root.get("variantId"), variantId));
        }
        
        // Tạo Specification cho Sales (tương tự)
        Specification<SalesSummaryByDealership> salesSpec = (root, query, cb) -> cb.conjunction();
        if (region != null && !region.isEmpty()) {
            salesSpec = salesSpec.and((root, query, cb) -> cb.equal(root.get("region"), region));
        }
        if (modelId != null && !modelId.isEmpty()) {
            salesSpec = salesSpec.and((root, query, cb) -> cb.equal(root.get("modelId"), modelId));
        }
        if (variantId != null && !variantId.isEmpty()) {
            salesSpec = salesSpec.and((root, query, cb) -> cb.equal(root.get("variantId"), variantId));
        }

        // Gọi service tính toán
        List<InventoryVelocityDTO> results = reportingService.calculateInventoryVelocity(inventorySpec, salesSpec);
        
        return ResponseEntity.ok(results);
    }

    /**
     * API: GET /reports/central-inventory
     * Phục vụ task: "Tồn kho trung tâm theo mẫu xe" (EVM Admin/Staff)
     */
    @GetMapping("/central-inventory")
    public ResponseEntity<List<CentralInventorySummary>> getCentralInventoryReport(
        @RequestParam(required = false) String modelId,
        @RequestParam(required = false) String variantId
    ) {
        Specification<CentralInventorySummary> spec = (root, query, cb) -> cb.conjunction();

        if (modelId != null && !modelId.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("modelId"), Long.valueOf(modelId)));
        }
        if (variantId != null && !variantId.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("variantId"), Long.valueOf(variantId)));
        }

        List<CentralInventorySummary> results = centralInventoryRepo.findAll(spec);
        return ResponseEntity.ok(results);
    }

    /**
     * API: GET /reports/central-inventory/transactions
     * Phục vụ task: "Lịch sử giao dịch kho trung tâm" (EVM Admin/Staff)
     */
    @GetMapping("/central-inventory/transactions")
    public ResponseEntity<List<CentralInventoryTransactionLog>> getCentralTransactionHistory(
        @RequestParam(required = false) String transactionType,
        @RequestParam(required = false) String variantId
    ) {
        Specification<CentralInventoryTransactionLog> spec = (root, query, cb) -> {
            query.orderBy(cb.desc(root.get("transactionDate")));
            return cb.conjunction();
        };

        if (transactionType != null && !transactionType.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("transactionType"), transactionType));
        }
        if (variantId != null && !variantId.isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("variantId"), Long.valueOf(variantId)));
        }

        List<CentralInventoryTransactionLog> results = centralTransactionLogRepo.findAll(spec);
        return ResponseEntity.ok(results);
    }
}
