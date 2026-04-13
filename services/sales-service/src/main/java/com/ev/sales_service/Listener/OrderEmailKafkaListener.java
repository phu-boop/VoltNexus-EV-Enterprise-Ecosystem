package com.ev.sales_service.Listener;

import com.ev.sales_service.service.Interface.EmailService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class OrderEmailKafkaListener {

    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "ev.sales.orderemail", groupId = "${spring.kafka.consumer.group-id}")
    public void handleOrderEmail(String payload) {
        log.info("Received order email event from Kafka: {}", payload);
        try {
            Map<String, Object> emailData = objectMapper.readValue(payload, new TypeReference<Map<String, Object>>() {});
            
            // Actually only handles order approved email currently based on outbox scraper logic
            // In the future, this can be expanded with an 'eventType' field in the payload
            emailService.sendOrderApprovedEmail(emailData);
            
            log.info("Successfully processed order email for orderId: {}", emailData.get("orderId"));
        } catch (Exception e) {
            log.error("Error processing order email event: {}", e.getMessage(), e);
        }
    }
}
