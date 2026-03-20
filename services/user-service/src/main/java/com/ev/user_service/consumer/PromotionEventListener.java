package com.ev.user_service.consumer;

import com.ev.common_lib.event.PromotionCreatedEvent;
import com.ev.user_service.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PromotionEventListener {

    private final ObjectMapper objectMapper;
    private final NotificationService notificationService; // implement accordingly

    @KafkaListener(topics = "promotion-events", groupId = "user-service-group")
    public void onMessage(String payload) {
        try {
            PromotionCreatedEvent event = objectMapper.readValue(payload, PromotionCreatedEvent.class);
            // idempotency: ensure we only create notification once per eventId
            if (notificationService.existsByEventId(event.getEventId())) {
                return; // already processed
            }

            // create notification record in DB
            notificationService.createPromotionNotification(event);

            // send FCM push to users (in NotificationService)
            notificationService.sendPromotionFCM(event);

        } catch (Exception e) {
            // log and rethrow if needed to let Kafka retry depending on your consumer settings
            throw new RuntimeException("Failed to process promotion event", e);
        }
    }
}
