package com.ev.sales_service;

import org.junit.jupiter.api.Test;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;

/**
 * Removed  to avoid needing a live DB/Kafka on CI.
 * Real business logic tests should be in separate unit test classes.
 */
class SalesServiceApplicationTests {

	@MockBean
	private KafkaTemplate<String, Object> kafkaTemplate;

	@Test
	void contextLoads() {
	}

}
