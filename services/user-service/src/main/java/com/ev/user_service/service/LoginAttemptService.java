package com.ev.user_service.service;

import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class LoginAttemptService {
    // 50 for testing collection
    private final int MAX_ATTEMPT = 50;
    private final long LOCK_TIME = TimeUnit.MINUTES.toMillis(15); // khóa 15 phút

    private final ConcurrentHashMap<String, Integer> attempts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> lockTime = new ConcurrentHashMap<>();

    public void loginSucceeded(String key) {
        attempts.remove(key);
        lockTime.remove(key);
    }

    public void loginFailed(String key) {
        int current = attempts.getOrDefault(key, 0);
        current++;
        attempts.put(key, current);

        if (current >= MAX_ATTEMPT) {
            lockTime.put(key, System.currentTimeMillis() + LOCK_TIME);
        }
    }

    public boolean isBlocked(String key) {
        Long until = lockTime.get(key);
        if (until == null) return false;
        if (System.currentTimeMillis() > until) {
            // Hết thời gian khóa
            attempts.remove(key);
            lockTime.remove(key);
            return false;
        }
        return true;
    }

    public int getRemainingAttempts(String key) {
        return MAX_ATTEMPT - attempts.getOrDefault(key, 0);
    }
}
