package com.example.reporting_service.service;

import com.example.reporting_service.dto.EnrichedInventoryStockEvent;
import com.example.reporting_service.dto.SaleEventDTO;
import com.example.reporting_service.model.DealerCache;
import com.example.reporting_service.model.VehicleCache;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;

import com.ev.common_lib.event.DealerStockUpdatedEvent;
import com.ev.common_lib.event.OrderDeliveredEvent;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class KafkaConsumerService {

    private final InventoryPersistenceService persistenceService;
    private final SalesPersistenceService salesPersistenceService;
    private final CentralInventoryPersistenceService centralInventoryPersistenceService;
    private final CacheService cacheService;
    private final ObjectMapper objectMapper;

    /**
     * Lắng nghe sự kiện TỒN KHO ĐẠI LÝ từ inventory-service
     */
    @KafkaListener(topics = "stock_events_dealerEVM", groupId = "reporting-service-group")
    public void handleInventoryEvent(ConsumerRecord<String, Object> record) {
        Object value = record.value();
        log.info("Nhận được message (Tồn kho) - offset={}: {}", record.offset(), value);

        // Skip nếu value là null (deserialization error đã được ErrorHandlingDeserializer xử lý)
        if (value == null) {
            log.warn("Received null value at offset {} (deserialization error), skipping...", record.offset());
            return;
        }

        try {
            // Convert LinkedHashMap hoặc String sang DTO
            DealerStockUpdatedEvent event;
            if (value instanceof String) {
                event = objectMapper.readValue((String) value, DealerStockUpdatedEvent.class);
            } else {
                event = objectMapper.convertValue(value, DealerStockUpdatedEvent.class);
            }
            
            // 2. Tra cứu Cache (Lazy-loading)
            DealerCache dealer = cacheService.getDealerInfo(event.getDealerId());
            if (dealer == null) {
                log.error("Cache Miss (không tìm thấy) cho Dealer: {}. Đang thử lại...", event.getDealerId());
                throw new RuntimeException("Cache Miss cho Dealer (sẽ retry): " + event.getDealerId());
            }

            // 3. Xây dựng DTO nội bộ (Enriched)
            EnrichedInventoryStockEvent enrichedEvent = new EnrichedInventoryStockEvent();
            enrichedEvent.setRegion(dealer.getRegion());
            enrichedEvent.setDealerId(event.getDealerId());
            enrichedEvent.setModelId(event.getModelId());
            enrichedEvent.setModelName(event.getModelName());
            enrichedEvent.setVariantId(event.getVariantId());
            enrichedEvent.setVariantName(event.getVariantName());
            
            // 4. Gán giá trị từ DTO gốc -> DTO nội bộ
            enrichedEvent.setStockOnHand(Long.valueOf(event.getNewAvailableQuantity()));
            
            // 5. GỌI LỚP PERSISTENCE
            persistenceService.saveInventorySummary(enrichedEvent);

            log.info("-> Đã cập nhật báo cáo tồn kho thành công cho: {}", event.getVariantName());

        } catch (Exception e) {
            log.error("LỖI GIAO DỊCH/LƯU MESSAGE (Tồn kho): " + e.getMessage());
            throw new RuntimeException("Failed to process Kafka message for DB save (Inventory).", e);
        }
    }

    /**
     * Lắng nghe sự kiện DOANH SỐ từ sales-service
     */
    @KafkaListener(topics = "sales.orders.delivered", groupId = "reporting-service-group")
    public void handleSaleEvent(ConsumerRecord<String, Object> record) {
        Object value = record.value();
        log.info("Nhận được message (Doanh số) - offset={}: {}", record.offset(), value);

        // Skip nếu value là null (deserialization error đã được ErrorHandlingDeserializer xử lý)
        if (value == null) {
            log.warn("Received null value at offset {} (deserialization error), skipping...", record.offset());
            return;
        }

        try {
            // Convert LinkedHashMap hoặc String sang DTO
            OrderDeliveredEvent event;
            if (value instanceof String) {
                event = objectMapper.readValue((String) value, OrderDeliveredEvent.class);
            } else {
                event = objectMapper.convertValue(value, OrderDeliveredEvent.class);
            }
            
            // 2. Tra cứu Cache (Lazy-loading)
            DealerCache dealer = cacheService.getDealerInfo(event.getDealerId());
            if (dealer == null) {
                log.error("Cache Miss (không tìm thấy) cho Dealer: {}. Đang thử lại...", event.getDealerId());
                throw new RuntimeException("Cache Miss cho Dealer (sẽ retry): " + event.getDealerId());
            }

            // 3. Lặp qua TỪNG MẶT HÀNG trong đơn hàng (Rất quan trọng)
            for (OrderDeliveredEvent.OrderItemDetail item : event.getItems()) {
                
                // 4. Tra cứu cache cho Xe
                VehicleCache vehicle = cacheService.getVehicleInfo(item.getVariantId());
                if (vehicle == null) {
                    log.error("Cache Miss (không tìm thấy) cho Vehicle: {}. Bỏ qua item này.", item.getVariantId());
                    continue; // Bỏ qua item này, xử lý item tiếp theo
                }
                
                // 5. Xây dựng DTO nội bộ (SaleEventDTO)
                SaleEventDTO saleDto = new SaleEventDTO();
                saleDto.setRegion(dealer.getRegion());
                saleDto.setDealershipId(dealer.getDealerId());
                saleDto.setDealershipName(dealer.getDealerName());
                
                saleDto.setModelId(vehicle.getModelId());
                saleDto.setModelName(vehicle.getModelName());
                saleDto.setVariantId(vehicle.getVariantId());
                saleDto.setVariantName(vehicle.getVariantName());
                
                saleDto.setQuantitySold((long) item.getQuantity());
                saleDto.setSalePrice(item.getFinalPrice().doubleValue());
                saleDto.setSaleTimestamp(Timestamp.valueOf(event.getDeliveryDate()));

                // 6. GỌI LỚP PERSISTENCE (cho từng item)
                salesPersistenceService.saveSaleSummary(saleDto);
            }

            log.info("-> Đã cập nhật báo cáo doanh số thành công cho Order: {}", event.getOrderId());

        } catch (Exception e) {
            log.error("LỖI GIAO DỊCH/LƯU MESSAGE (Doanh số): " + e.getMessage());
            throw new RuntimeException("Failed to process Kafka message for DB save (Sales).", e);
        }
    }

    /**
     * Lắng nghe sự kiện GIAO DỊCH KHO TRUNG TÂM từ inventory-service
     * Topic: inventory_events
     * Event chứa: InventoryTransaction entity (variantId, transactionType, quantity, staffId, notes, etc.)
     */
    @KafkaListener(topics = "inventory_events", groupId = "reporting-service-group")
    public void handleCentralInventoryEvent(ConsumerRecord<String, Object> record) {
        Object value = record.value();
        log.info("Nhận được message (Kho trung tâm) - offset={}: {}", record.offset(), value);

        if (value == null) {
            log.warn("Received null value at offset {} (deserialization error), skipping...", record.offset());
            return;
        }

        try {
            // Convert message sang LinkedHashMap
            LinkedHashMap<String, Object> eventMap;
            if (value instanceof String) {
                eventMap = objectMapper.readValue((String) value, LinkedHashMap.class);
            } else if (value instanceof LinkedHashMap) {
                eventMap = (LinkedHashMap<String, Object>) value;
            } else {
                eventMap = objectMapper.convertValue(value, LinkedHashMap.class);
            }

            // Trích xuất fields từ InventoryTransaction
            Long variantId = toLong(eventMap.get("variantId"));
            String transactionType = (String) eventMap.get("transactionType");
            Integer quantity = toInt(eventMap.get("quantity"));
            String staffId = (String) eventMap.get("staffId");
            String notes = (String) eventMap.get("notes");
            String referenceId = (String) eventMap.get("referenceId");
            String toDealerId = eventMap.get("toDealerId") != null ? eventMap.get("toDealerId").toString() : null;
            String fromDealerId = eventMap.get("fromDealerId") != null ? eventMap.get("fromDealerId").toString() : null;

            // Parse transactionDate
            LocalDateTime transactionDate = LocalDateTime.now();
            if (eventMap.get("transactionDate") != null) {
                try {
                    transactionDate = objectMapper.convertValue(eventMap.get("transactionDate"), LocalDateTime.class);
                } catch (Exception e) {
                    log.warn("Không parse được transactionDate, dùng thời gian hiện tại");
                }
            }

            if (variantId == null || transactionType == null || quantity == null) {
                log.error("Event thiếu thông tin bắt buộc (variantId, transactionType, quantity). Bỏ qua.");
                return;
            }

            // Enrich với thông tin vehicle từ cache
            String variantName = null;
            Long modelId = null;
            String modelName = null;

            VehicleCache vehicle = cacheService.getVehicleInfo(variantId);
            if (vehicle != null) {
                variantName = vehicle.getVariantName();
                modelId = vehicle.getModelId();
                modelName = vehicle.getModelName();
            } else {
                log.warn("Không tìm thấy thông tin vehicle cho variantId={}. Lưu với thông tin rỗng.", variantId);
            }

            // Dispatch theo transactionType
            switch (transactionType) {
                case "RESTOCK":
                case "INITIAL_STOCK":
                    centralInventoryPersistenceService.handleRestock(
                            variantId, variantName, modelId, modelName,
                            quantity, staffId, notes, referenceId, transactionDate);
                    break;

                case "ALLOCATE":
                    centralInventoryPersistenceService.handleAllocate(
                            variantId, variantName, modelId, modelName,
                            quantity, staffId, notes, referenceId, transactionDate);
                    break;

                case "TRANSFER_TO_DEALER":
                    centralInventoryPersistenceService.handleTransferToDealer(
                            variantId, variantName, modelId, modelName,
                            quantity, toDealerId, staffId, notes, referenceId, transactionDate);
                    break;

                default:
                    centralInventoryPersistenceService.handleOtherTransaction(
                            variantId, variantName, modelId, modelName,
                            transactionType, quantity, fromDealerId, toDealerId,
                            staffId, notes, referenceId, transactionDate);
                    break;
            }

            log.info("-> Đã xử lý event kho trung tâm: type={}, variant={}, qty={}",
                    transactionType, variantId, quantity);

        } catch (Exception e) {
            log.error("LỖI xử lý message (Kho trung tâm): " + e.getMessage(), e);
            throw new RuntimeException("Failed to process Kafka message for DB save (Central Inventory).", e);
        }
    }

    // ========== HELPER METHODS ==========

    private Long toLong(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Number) return ((Number) obj).longValue();
        try { return Long.parseLong(obj.toString()); } catch (Exception e) { return null; }
    }

    private Integer toInt(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Number) return ((Number) obj).intValue();
        try { return Integer.parseInt(obj.toString()); } catch (Exception e) { return null; }
    }
}
