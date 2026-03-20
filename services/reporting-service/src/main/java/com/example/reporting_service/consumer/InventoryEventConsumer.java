package com.example.reporting_service.consumer;

import com.example.reporting_service.dto.EnrichedInventoryStockEvent; // DTO này được dùng trong InventoryPersistenceService
import com.example.reporting_service.model.DealerCache;
import com.example.reporting_service.service.CacheService;
import com.example.reporting_service.service.InventoryPersistenceService;
import com.ev.common_lib.event.DealerStockUpdatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryEventConsumer {

    private final InventoryPersistenceService persistenceService;
    private final CacheService cacheService;

    // Lắng nghe topic từ InventoryServiceImpl
    @KafkaListener(topics = "stock_events_dealerEVM", groupId = "reporting-service-group")
    public void handleStockUpdate(DealerStockUpdatedEvent event) {
        log.info("Nhận sự kiện tồn kho cho Dealer: {}", event.getDealerId());

        // 1. Tra cứu thông tin Đại lý (để lấy Region)
        DealerCache dealer = cacheService.getDealerInfo(event.getDealerId());
        if (dealer == null) {
            log.error("Không thể xử lý tồn kho, thiếu thông tin Dealer: {}", event.getDealerId());
            return;
        }

        // 2. Xây dựng DTO (theo file InventoryPersistenceService.java)
        // Sự kiện từ inventory-service đã có đủ thông tin xe (model/variant name)
        EnrichedInventoryStockEvent enrichedEvent = new EnrichedInventoryStockEvent();
        enrichedEvent.setRegion(dealer.getRegion());
        enrichedEvent.setDealerId(event.getDealerId()); // Thêm cái này để tính delta
        
        enrichedEvent.setModelId(event.getModelId());
        enrichedEvent.setModelName(event.getModelName());
        enrichedEvent.setVariantId(event.getVariantId());
        enrichedEvent.setVariantName(event.getVariantName());
        enrichedEvent.setStockOnHand(Long.valueOf(event.getNewAvailableQuantity()));
        // 3. Gọi service persistence của bạn để lưu vào DB
        try {
            persistenceService.saveInventorySummary(enrichedEvent);
        } catch (Exception e) {
            log.error("Lỗi khi lưu báo cáo tồn kho: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi DB khi lưu tóm tắt tồn kho", e);
        }
    }
}
