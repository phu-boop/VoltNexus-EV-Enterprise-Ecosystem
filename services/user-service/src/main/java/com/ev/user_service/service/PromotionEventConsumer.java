package com.ev.user_service.service;

import com.ev.common_lib.event.PromotionCreatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PromotionEventConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "promotion-events", groupId = "user-service-group")
    public void handlePromotionCreated(PromotionCreatedEvent event) {
        notificationService.sendPromotionFCM(event);
    }
}
