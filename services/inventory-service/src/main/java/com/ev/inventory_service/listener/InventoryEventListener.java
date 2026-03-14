package com.ev.inventory_service.listener;

import com.ev.common_lib.dto.inventory.AllocationRequestDto;
import com.ev.inventory_service.services.Interface.InventoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryEventListener {

    // Tiêm (inject) service có sẵn của bạn
    private final InventoryService inventoryService; 
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${app.kafka.topic.order-approved}", 
                   groupId = "inventory-allocation-group") // Group ID mới
    public void handleOrderApproved(String message) {
        try {
            log.info(">>> INVENTORY-SERVICE: [NHẬN THÀNH CÔNG] sự kiện OrderApproved!");

            // 1. Chuyển đổi JSON thành DTO
            AllocationRequestDto allocationRequest = objectMapper.readValue(message, AllocationRequestDto.class);

            if (allocationRequest == null || allocationRequest.getOrderId() == null) {
                log.error("Lỗi deserialization: AllocationRequestDto không hợp lệ. Message: {}", message);
                return;
            }

            log.info("Đang xử lý GIỮ HÀNG (Allocate) cho Order ID: {}", allocationRequest.getOrderId());

            // 2. Gọi hàm allocateStockForOrder (đã có sẵn)
            inventoryService.allocateStockForOrder(allocationRequest, "system-kafka-listener");

            log.info("Xử lý GIỮ HÀNG (Allocate) THÀNH CÔNG cho Order ID: {}", allocationRequest.getOrderId());

        } catch (Exception e) {
            log.error("Lỗi nghiêm trọng khi xử lý sự kiện OrderApproved: {}", message, e);
            // Cần có cơ chế DLQ
        }
    }
}
