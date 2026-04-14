package com.ev.sales_service.scheduler;

import com.ev.sales_service.entity.Outbox;
import com.ev.sales_service.repository.OutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxScraper {

    private final OutboxRepository outboxRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    private static final int BATCH_SIZE = 50;
    private static final int MAX_ATTEMPTS = 5;

    @Scheduled(fixedDelay = 5000) // Chạy mỗi 5 giây
    @Transactional
    public void scrapeOutbox() {
        List<Outbox> pendingEvents = outboxRepository.findByStatusOrderByCreatedAtAsc("NEW", PageRequest.of(0, BATCH_SIZE));
        
        if (pendingEvents.isEmpty()) {
            return;
        }

        log.debug("Found {} pending events in outbox", pendingEvents.size());

        for (Outbox event : pendingEvents) {
            processEvent(event);
        }
    }

    private void processEvent(Outbox event) {
        try {
            String topic = "ev.sales." + event.getAggregateType().toLowerCase();
            
            log.info("Publishing event {} to topic {}", event.getId(), topic);
            
            kafkaTemplate.send(topic, event.getAggregateId(), event.getPayload()).get();

            event.setStatus("SENT");
            event.setSentAt(LocalDateTime.now());
            outboxRepository.save(event);
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Failed to publish event {}: {}", event.getId(), e.getMessage());
            
            event.setAttempts(event.getAttempts() + 1);
            event.setLastAttemptAt(LocalDateTime.now());
            
            if (event.getAttempts() >= MAX_ATTEMPTS) {
                event.setStatus("FAILED");
            }
            outboxRepository.save(event);
        } catch (Exception e) {
            log.error("Failed to publish event {}: {}", event.getId(), e.getMessage());
            
            event.setAttempts(event.getAttempts() + 1);
            event.setLastAttemptAt(LocalDateTime.now());
            
            if (event.getAttempts() >= MAX_ATTEMPTS) {
                event.setStatus("FAILED");
            }
            outboxRepository.save(event);
        }
    }
}
