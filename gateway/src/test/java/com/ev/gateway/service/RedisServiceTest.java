package com.ev.gateway.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RedisServiceTest {

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private RedisService redisService;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        redisService = new RedisService(redisTemplate);
    }

    @Test
    void saveOtp_ShouldCallRedis() {
        redisService.saveOtp("test@example.com", "123456", 5);
        verify(valueOperations).set(eq("OTP:test@example.com"), eq("123456"), any(Duration.class));
    }

    @Test
    void validateOtp_CorrectOtp_ShouldReturnTrue() {
        String email = "test@example.com";
        String otp = "123456";
        when(valueOperations.get("OTP:" + email)).thenReturn(otp);

        assertTrue(redisService.validateOtp(email, otp));
    }

    @Test
    void validateOtp_IncorrectOtp_ShouldReturnFalse() {
        String email = "test@example.com";
        String otp = "123456";
        when(valueOperations.get("OTP:" + email)).thenReturn("wrong");

        assertFalse(redisService.validateOtp(email, otp));
    }

    @Test
    void addToken_ShouldCallRedis() {
        redisService.addToken("my-token", 3600);
        verify(valueOperations).set(eq("LOGOUT:my-token"), eq("logout"), eq(Duration.ofSeconds(3600)));
    }

}
