package com.ev.user_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

@SpringBootTest
class UserServiceApplicationTests {

	@MockBean
	private KafkaTemplate<String, Object> kafkaTemplate;

	@MockBean
	private org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory lettuceConnectionFactory;

	@MockBean
	private RedisTemplate<String, Object> redisTemplate;

	@Test
	void contextLoads() {
	}

}
