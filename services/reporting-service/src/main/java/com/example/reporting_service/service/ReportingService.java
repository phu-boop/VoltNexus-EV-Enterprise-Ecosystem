package com.example.reporting_service.service;

import com.example.reporting_service.dto.InventoryVelocityDTO;
import com.example.reporting_service.model.InventorySummaryByRegion;
import com.example.reporting_service.model.SalesSummaryByDealership;
import com.example.reporting_service.repository.InventorySummaryRepository;
import com.example.reporting_service.repository.SalesSummaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportingService {

    @Autowired
    private InventorySummaryRepository inventoryRepo;

    @Autowired
    private SalesSummaryRepository salesRepo;

    // Mặc định tính tốc độ tiêu thụ trong 30 ngày
    private static final int DEFAULT_DAYS_PERIOD = 30;

    public List<InventoryVelocityDTO> calculateInventoryVelocity(Specification<InventorySummaryByRegion> inventorySpec,
                                                               Specification<SalesSummaryByDealership> salesSpec) {

        // Bước 1: Lấy tồn kho hiện tại (dựa trên filter)
        List<InventorySummaryByRegion> inventoryList = inventoryRepo.findAll(inventorySpec);

        // Bước 2: Lấy doanh số trong 30 ngày qua (dựa trên filter)
        // (Lưu ý: salesSpec có thể cần điều chỉnh nếu filter khác inventorySpec, 
        // ví dụ: salesSpec không filter theo 'dealershipId' nếu muốn xem velocity theo 'region')
        
        // Tính mốc thời gian 30 ngày trước
        Timestamp thirtyDaysAgo = Timestamp.from(Instant.now().minus(DEFAULT_DAYS_PERIOD, ChronoUnit.DAYS));

        // Thêm điều kiện thời gian vào specification
        Specification<SalesSummaryByDealership> finalSalesSpec = salesSpec
            .and((root, query, cb) -> cb.greaterThan(root.get("lastSaleAt"), thirtyDaysAgo));

        // Group sales by (region, model, variant)
        // Vì SalesSummaryByDealership đang chi tiết tới 'dealershipId', 
        // chúng ta cần tổng hợp lại theo (region, model, variant) để khớp với InventorySummaryByRegion
        Map<String, Long> salesMap = salesRepo.findAll(finalSalesSpec).stream()
            .collect(Collectors.groupingBy(
                // Tạo key: "region:modelId:variantId"
                sale -> sale.getRegion() + ":" + sale.getModelId() + ":" + sale.getVariantId(),
                // Tính tổng 'totalUnitsSold'
                Collectors.summingLong(SalesSummaryByDealership::getTotalUnitsSold)
            ));

        // Bước 3: Tính toán Velocity cho từng record tồn kho
        return inventoryList.stream().map(inventory -> {
            String key = inventory.getRegion() + ":" + inventory.getModelId() + ":" + inventory.getVariantId();
            
            // Lấy doanh số 30 ngày từ map
            Long salesLast30Days = salesMap.getOrDefault(key, 0L);
            Long currentStock = inventory.getTotalStock();
            
            // Tính toán
            Double avgDailySales = (double) salesLast30Days / DEFAULT_DAYS_PERIOD;
            Double daysOfSupply = (avgDailySales == 0) ? Double.POSITIVE_INFINITY : (currentStock / avgDailySales); // Nếu không bán (chia 0) -> tồn vĩnh viễn

            // Tạo DTO kết quả
            return new InventoryVelocityDTO(
                inventory.getRegion(),
                inventory.getModelId(),
                inventory.getModelName(),
                inventory.getVariantId(),
                inventory.getVariantName(),
                currentStock,
                salesLast30Days,
                avgDailySales,
                daysOfSupply
            );
        }).collect(Collectors.toList());
    }
}
