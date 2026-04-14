package com.ev.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Lightweight Spring Boot context test.
 * Uses webEnvironment=NONE to avoid starting a real HTTP server.
 * No DB/Kafka connection needed for gateway.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class GatewayApplicationTests {

	@Autowired
	private ApplicationContext context;

	@Test
	void contextLoads() {
		assertThat(context).isNotNull();
	}

}
