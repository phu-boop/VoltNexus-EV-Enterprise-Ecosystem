package com.ev.customer_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import static org.assertj.core.api.Assertions.assertThat;


import org.junit.jupiter.api.Test;

/**
 * Placeholder test — keeps Maven happy without needing a running DB.
 * Real business logic tests live in service/impl/*Test.java
 */
class CustomerServiceApplicationTests {

	@Autowired
	private ApplicationContext context;

	@Test
	void contextLoads() {
	    assertThat(context).isNotNull();
	}
}
