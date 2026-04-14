package com.ev.payment_service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Lightweight context load test.
 * Real business logic tests should be in separate unit test classes.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class PaymentServiceApplicationTests {

        @Autowired
        private ApplicationContext context;

        @Test
        void contextLoads() {
            assertThat(context).isNotNull();
        }

}
