package com.ev.user_service.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class RedisService {
     private final RedisTemplate<String, String> redisTemplate;

    //Service OTP
    public RedisService(RedisTemplate<String, String> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void saveOtp(String email, String otp, long expiryMinutes) {
        redisTemplate.opsForValue().set("OTP:" + email, otp, Duration.ofMinutes(1));
    }

    public boolean validateOtp(String email, String otp) {
        String storedOtp = redisTemplate.opsForValue().get("OTP:" + email);
        return otp.equals(storedOtp);
    }

    public void removeOtp(String email) {
        redisTemplate.delete("OTP:" + email);
    }




    //Service Token(Add token in backlist)
    public void addToken(String token, long expirationSeconds) {
        redisTemplate.opsForValue().set("LOGOUT:"+token, "logout", Duration.ofSeconds(expirationSeconds));
    }

    public boolean contains(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey("LOGOUT:"+token));
    }


}
