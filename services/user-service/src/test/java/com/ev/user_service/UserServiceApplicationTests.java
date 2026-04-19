package com.ev.user_service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.ApplicationContext;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Lightweight context load test.
 * Kafka and Redis are mocked to avoid needing live infrastructure on CI.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class UserServiceApplicationTests {

        @MockBean
        private KafkaTemplate<String, Object> kafkaTemplate;

        @MockBean
        private org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory lettuceConnectionFactory;

        @MockBean
        private RedisTemplate<String, Object> redisTemplate;

        @Autowired
        private ApplicationContext context;

        @Test
        void contextLoads() {
            assertThat(context).isNotNull();
        }

}
