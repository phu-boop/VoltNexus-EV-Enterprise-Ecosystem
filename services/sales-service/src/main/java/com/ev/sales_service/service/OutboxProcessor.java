package com.ev.sales_service.service;

import com.ev.sales_service.entity.Outbox;
import com.ev.sales_service.repository.OutboxRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OutboxProcessor {

    private final OutboxRepository outboxRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private static final String TOPIC = "promotion-events";

    private static final String TOPIC_ORDER_SHIPPED = "sales.orders.shipped";
    private static final String TOPIC_ORDER_APPROVED = "sales.orders.approved";
    private static final String TOPIC_ORDER_PLACED = "sales.orders.placed";
    private static final String TOPIC_ORDER_CANCELLED = "sales.orders.cancelled";
    private static final String TOPIC_ORDER_DELIVERED = "sales.orders.delivered";
    private static final String TOPIC_UNKNOWN = "sales.unknown_events";
    private static final String TOPIC_ORDER_ISSUE_REPORTED = "sales.orders.issue_reported";
    private static final String TOPIC_B2C_ORDER_PLACED = "sales.b2c.orders.placed";

    @Scheduled(fixedDelay = 10000)
    public void pollOutbox() {
        log.info(">>> OUTBOX-POLLER: Đang kiểm tra Outbox để tìm sự kiện mới...");
        // Gọi hàm mà bạn đã viết
        this.dispatchTransactional(); 
    }

    @Transactional
    public void dispatchTransactional() {
        List<Outbox> items = outboxRepository.findByStatusOrderByCreatedAtAsc("NEW", PageRequest.of(0, 100));
        if (items.isEmpty()) return;

        for (Outbox o : items) {
            try {
                int updated = outboxRepository.markStatusIfCurrent(o.getId(), "SENDING", "NEW");
                if (updated == 0) continue;

                // 1. Lấy topic động dựa trên eventType
                String topicName = getTopicForEvent(o.getEventType());

                // 2. Thêm log để bạn biết chuyện gì đang xảy ra
                log.info(">>> OUTBOX-POLLER: Đang gửi sự kiện EventType '{}' (ID: {}) lên Topic '{}'", 
                    o.getEventType(), o.getAggregateId(), topicName);

                // 3. Gửi đến topic động
                kafkaTemplate.send(topicName, o.getAggregateId(), o.getPayload()).get(); 
                
                markSent(o.getId());

            } catch (Exception ex) {
                log.error("Lỗi khi gửi sự kiện ID {}: {}", o.getId(), ex.getMessage());
                handleSendFailure(o);
            }
        }
    }

    /**
     * Ánh xạ (map) EventType (từ DB) sang tên Topic Kafka thực tế.
     */
    private String getTopicForEvent(String eventType) {
        if (eventType == null) {
            return TOPIC_UNKNOWN;
        }
        
        // Logic map EventType -> Tên Topic
        switch (eventType) {
            // --- NGHIỆP VỤ SALES ---
            case "OrderApproved":
                return TOPIC_ORDER_APPROVED;
            case "B2BOrderPlaced":
                return TOPIC_ORDER_PLACED;
            case "B2COrderPlaced":
                return TOPIC_B2C_ORDER_PLACED;
            case "OrderCancelled":
                return TOPIC_ORDER_CANCELLED;
            case "OrderDelivered":
                return TOPIC_ORDER_DELIVERED;
            case "OrderIssueReported": 
                return TOPIC_ORDER_ISSUE_REPORTED;
            
            // --- NGHIỆP VỤ PROMOTION  ---
            
            case "PromotionEventType": 
                return TOPIC;

            // PROMOTION EVENT
            case "PromotionCreated":      
                return TOPIC;
            
            // --- MẶC ĐỊNH ---
            default:
                log.warn("Không tìm thấy Topic cho eventType: {}. Sẽ gửi đến topic UNKNOWN.", eventType);
                return TOPIC_UNKNOWN;
        }
    }

    @Transactional
    protected void markSent(String id) {
        Outbox o = outboxRepository.findById(id).orElseThrow();
        o.setStatus("SENT");
        o.setSentAt(LocalDateTime.now());
        o.setLastAttemptAt(LocalDateTime.now());
        outboxRepository.save(o);
    }

    @Transactional
    protected void handleSendFailure(Outbox o) {
        Outbox current = outboxRepository.findById(o.getId()).orElse(null);
        if (current == null) return;

        int newAttempts = current.getAttempts() + 1;
        current.setAttempts(newAttempts);
        current.setLastAttemptAt(LocalDateTime.now());
        current.setStatus(newAttempts >= 5 ? "FAILED" : "NEW");
        outboxRepository.save(current);
    }
}

