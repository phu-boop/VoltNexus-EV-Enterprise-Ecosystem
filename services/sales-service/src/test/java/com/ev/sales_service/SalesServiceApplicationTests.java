package com.ev.sales_service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.ApplicationContext;
import org.springframework.kafka.core.KafkaTemplate;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Lightweight context load test.
 * KafkaTemplate is mocked to avoid needing a live broker on CI.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
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
