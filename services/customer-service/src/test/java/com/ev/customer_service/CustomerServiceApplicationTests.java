package com.ev.customer_service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Lightweight context load test.
 * Real business logic tests live in service/impl/*Test.java
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class CustomerServiceApplicationTests {

        @Autowired
        private ApplicationContext context;

        @Test
        void contextLoads() {
            assertThat(context).isNotNull();
        }
}
