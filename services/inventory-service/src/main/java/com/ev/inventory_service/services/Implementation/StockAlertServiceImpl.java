package com.ev.inventory_service.services.Implementation;

import com.ev.inventory_service.model.CentralInventory;
import com.ev.inventory_service.model.DealerAllocation;
import com.ev.inventory_service.model.StockAlert;
import com.ev.inventory_service.repository.CentralInventoryRepository;
import com.ev.inventory_service.repository.DealerAllocationRepository;
import com.ev.inventory_service.repository.StockAlertRepository;
import com.ev.inventory_service.services.Interface.StockAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StockAlertServiceImpl implements StockAlertService {

    private final CentralInventoryRepository centralRepo;
    private final DealerAllocationRepository dealerRepo; 
    private final StockAlertRepository alertRepo;

    @Override
    @Scheduled(cron = "0 0 1 * * ?") // Chạy vào 1h sáng mỗi ngày
    @Transactional
    public void checkStockLevelsAndCreateAlerts() {

        // --- 1. KIỂM TRA TỒN KHO TRUNG TÂM ---
        List<CentralInventory> allCentralInventory = centralRepo.findAll();
        for (CentralInventory inventory : allCentralInventory) {
            boolean isStockLow = inventory.getReorderLevel() != null 
                              && inventory.getAvailableQuantity() < inventory.getReorderLevel();

            if (isStockLow) {
                // Kiểm tra xem đã có cảnh báo "NEW" cho sản phẩm này tại kho trung tâm chưa
                boolean alertExists = !alertRepo.findByVariantIdAndDealerIdAndStatus(inventory.getVariantId(), null, "NEW").isEmpty();

                if (!alertExists) {
                    createAlert(inventory.getVariantId(), null, "LOW_STOCK_CENTRAL", inventory.getAvailableQuantity(), inventory.getReorderLevel());
                }
            }
        }
        
        // --- 2. KIỂM TRA TỒN KHO CỦA TẤT CẢ ĐẠI LÝ ---
        List<DealerAllocation> allDealerAllocations = dealerRepo.findAll();
        for (DealerAllocation allocation : allDealerAllocations) {
            boolean isStockLow = allocation.getReorderLevel() != null
                              && allocation.getAvailableQuantity() < allocation.getReorderLevel();

            if (isStockLow) {
                // Kiểm tra xem đã có cảnh báo "NEW" cho sản phẩm này tại đại lý này chưa
                boolean alertExists = !alertRepo.findByVariantIdAndDealerIdAndStatus(allocation.getVariantId(), allocation.getDealerId(), "NEW").isEmpty();

                if (!alertExists) {
                    createAlert(allocation.getVariantId(), allocation.getDealerId(), "LOW_STOCK_DEALER", allocation.getAvailableQuantity(), allocation.getReorderLevel());
                }
            }
        }
        
    }

    @Override
    public List<StockAlert> getActiveAlerts() {
        return alertRepo.findAllByStatus("NEW");
    }

    /**
     * Hàm helper để tạo và lưu một cảnh báo mới.
     */
    private void createAlert(Long variantId, UUID dealerId, String alertType, int currentStock, int threshold) {
        StockAlert newAlert = new StockAlert();
        newAlert.setVariantId(variantId);
        newAlert.setDealerId(dealerId); // Sẽ là null nếu là kho trung tâm
        newAlert.setAlertType(alertType);
        newAlert.setCurrentStock(currentStock);
        newAlert.setThreshold(threshold);
        newAlert.setStatus("NEW");
        alertRepo.save(newAlert);
    }
}