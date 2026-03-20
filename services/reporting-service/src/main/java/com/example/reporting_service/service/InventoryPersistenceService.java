package com.example.reporting_service.service;

import com.example.reporting_service.dto.EnrichedInventoryStockEvent;
import com.example.reporting_service.repository.InventorySummaryRepository;
import com.example.reporting_service.repository.DealerStockSnapshotRepository;
import com.example.reporting_service.model.DealerStockSnapshotId;
import com.example.reporting_service.model.DealerStockSnapshot;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.UUID;

@Service
@RequiredArgsConstructor // Dùng @RequiredArgsConstructor
public class InventoryPersistenceService {

    private final InventorySummaryRepository inventoryRepository;
    // (Bảng cache này lưu trữ số tồn kho CUỐI CÙNG của từng ĐẠI LÝ)
    private final DealerStockSnapshotRepository snapshotRepo; 

    @Transactional
    public void saveInventorySummary(EnrichedInventoryStockEvent event) {
        
        // 1. Tìm tồn kho cũ của đại lý này (từ snapshot)
        UUID dealerId = event.getDealerId();
        Long variantId = event.getVariantId();
        Long oldStock = snapshotRepo.findById(new DealerStockSnapshotId(dealerId, variantId))
                            .map(DealerStockSnapshot::getCurrentStock)
                            .orElse(0L);
        
        Long newStock = event.getStockOnHand();
        Long delta = newStock - oldStock; // Thay đổi (chênh lệch)

        // 2. Cập nhật snapshot với giá trị MỚI
        snapshotRepo.save(new DealerStockSnapshot(dealerId, variantId, newStock));

        // 3. CẬP NHẬT BẢNG TỔNG HỢP VỚI "DELTA"
        // (Đây là logic an toàn để cập nhật tổng kho khu vực)
        inventoryRepository.updateStockByDelta(
            event.getRegion(),
            event.getVariantId(),
            delta, // Chỉ cộng/trừ phần chênh lệch
            event.getModelId(), 
            event.getModelName(), 
            event.getVariantName()
        );
    }
}