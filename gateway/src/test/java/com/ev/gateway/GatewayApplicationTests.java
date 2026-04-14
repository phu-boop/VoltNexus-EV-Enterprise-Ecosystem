package com.ev.gateway;

import com.ev.gateway.service.RedisService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

/**
 * Lightweight context load test.
 * Redis beans are replaced with mocks via @TestConfiguration to avoid
 * needing a live Redis instance on CI. No deprecated @MockBean used.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class GatewayApplicationTests {

    @TestConfiguration
    static class TestRedisConfig {

        @Bean
        @Primary
        public LettuceConnectionFactory redisConnectionFactory() {
            return mock(LettuceConnectionFactory.class);
        }

        @Bean
        @Primary
        @SuppressWarnings("unchecked")
        public RedisTemplate<String, Object> redisTemplate() {
            return mock(RedisTemplate.class);
        }

        @Bean
        @Primary
        public RedisService redisService() {
            return mock(RedisService.class);
        }
    }

    @Autowired
    private ApplicationContext context;

    @Test
    void contextLoads() {
        assertThat(context).isNotNull();
    }

}
