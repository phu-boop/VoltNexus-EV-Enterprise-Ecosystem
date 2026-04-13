package com.ev.sales_service.Listener;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class CustomerKafkaListener {

    @KafkaListener(topics = "customer.updated", groupId = "${spring.kafka.consumer.group-id}")
    @CacheEvict(value = "customers", key = "#customerId")
    public void handleCustomerUpdated(Long customerId) {
        log.info("Received customer update event for id: {}. Evicting cache.", customerId);
    }
    
    @KafkaListener(topics = "customer.deleted", groupId = "${spring.kafka.consumer.group-id}")
    @CacheEvict(value = "customers", key = "#customerId")
    public void handleCustomerDeleted(Long customerId) {
        log.info("Received customer delete event for id: {}. Evicting cache.", customerId);
    }
}
