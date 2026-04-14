package com.ev.sales_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import static org.assertj.core.api.Assertions.assertThat;


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

	@Autowired
	private ApplicationContext context;

	@Test
	void contextLoads() {
	    assertThat(context).isNotNull();
	}

}
