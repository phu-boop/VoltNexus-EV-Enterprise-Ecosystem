package com.ev.user_service.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;

@Component
public class RedisService {
    private static final Logger log = LoggerFactory.getLogger(RedisService.class);
    private final RedisTemplate<String, String> redisTemplate;

    public RedisService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void saveOtp(String email, String otp, long expiryMinutes) {
        try {
            redisTemplate.opsForValue().set("OTP:" + email, otp, Duration.ofMinutes(1));
        } catch (Exception e) {
            log.warn("Lỗi kết nối Redis (saveOtp): {}", e.getMessage());
        }
    }

    public boolean validateOtp(String email, String otp) {
        try {
            String storedOtp = redisTemplate.opsForValue().get("OTP:" + email);
            return otp.equals(storedOtp);
        } catch (Exception e) {
            log.warn("Lỗi kết nối Redis (validateOtp): {}", e.getMessage());
            return false;
        }
    }

    public void removeOtp(String email) {
        try {
            redisTemplate.delete("OTP:" + email);
        } catch (Exception e) {
            log.warn("Lỗi kết nối Redis (removeOtp): {}", e.getMessage());
        }
    }

    public void addToken(String token, long expirationSeconds) {
        try {
            redisTemplate.opsForValue().set("LOGOUT:" + token, "logout", Duration.ofSeconds(expirationSeconds));
        } catch (Exception e) {
            log.warn("Lỗi kết nối Redis (addToken): {}", e.getMessage());
        }
    }

    public boolean contains(String token) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey("LOGOUT:" + token));
        } catch (Exception e) {
            log.warn("Lỗi kết nối Redis (contains token): {}", e.getMessage());
            return false;
        }
    }
}
