package com.ev.sales_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;

@SpringBootTest
class SalesServiceApplicationTests {

	@MockBean
	private KafkaTemplate<String, Object> kafkaTemplate;

	@Test
	void contextLoads() {
	}

}
