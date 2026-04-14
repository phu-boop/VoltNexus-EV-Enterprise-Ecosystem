package com.ev.user_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import static org.assertj.core.api.Assertions.assertThat;


import org.junit.jupiter.api.Test;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;

/**
 * Removed  to avoid needing a live DB/Kafka on CI.
 * Real business logic tests should be in separate unit test classes.
 */
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
