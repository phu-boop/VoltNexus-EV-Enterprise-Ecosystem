package com.ev.gateway.config;

import org.junit.jupiter.api.Test;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class RedisConfigurationTest {

    @Test
    void redisConfiguration_BeansCreation() {
        RedisConfiguration config = new RedisConfiguration();
        ReflectionTestUtils.setField(config, "redisHost", "localhost");
        ReflectionTestUtils.setField(config, "redisPort", 6379);

        LettuceConnectionFactory factory = config.redisConnectionFactory();
        assertNotNull(factory);
        assertEquals("localhost", factory.getHostName());
        assertEquals(6379, factory.getPort());

        RedisTemplate<String, Object> template = config.redisTemplate();
        assertNotNull(template);
    }
}
