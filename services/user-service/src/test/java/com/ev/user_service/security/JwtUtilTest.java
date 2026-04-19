package com.ev.user_service.security;

import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    // Secure base64 key for testing (at least 256 bits for HMAC-SHA256)
    private final String secretKey = "VGhpcy1pcy1hLXZlcnktc2VjdXJlLWtleS1mb3ItdGVzdGluZy1wdXJwb3Nlcw==";
    private final long accessExpirationMs = 3600000; // 1 hour
    private final long refreshExpirationMs = 86400000; // 24 hours

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(secretKey, accessExpirationMs, refreshExpirationMs);
    }

    @Test
    void testGenerateAndValidateAccessToken() {
        String email = "test@example.com";
        String role = "USER";
        String userId = "user-123";
        String profileId = "profile-123";
        String dealerId = "dealer-123";

        String token = jwtUtil.generateAccessToken(email, role, userId, profileId, dealerId);

        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));
        assertTrue(jwtUtil.isTokenValid(token, email));

        assertEquals(email, jwtUtil.extractEmail(token));
        assertEquals(role, jwtUtil.extractRole(token));
        assertEquals(userId, jwtUtil.extractUserId(token));
        assertEquals(profileId, jwtUtil.extractProfileId(token));
        assertEquals(dealerId, jwtUtil.extractDealerId(token));
    }

    @Test
    void testGenerateAndValidateRefreshToken() {
        String email = "admin@example.com";
        String role = "ADMIN";
        String userId = "admin-123";
        String profileId = "profile-456";

        // Dealer ID can be null
        String token = jwtUtil.generateRefreshToken(email, role, userId, profileId, null);

        assertNotNull(token);
        assertTrue(jwtUtil.validateToken(token));
        assertTrue(jwtUtil.isTokenValid(token, email));

        assertEquals(email, jwtUtil.extractEmail(token));
        assertEquals(role, jwtUtil.extractRole(token));
        assertEquals(userId, jwtUtil.extractUserId(token));
        assertEquals(profileId, jwtUtil.extractProfileId(token));
        assertNull(jwtUtil.extractDealerId(token));
    }

    @Test
    void testInvalidToken() {
        String invalidToken = "this.is.an.invalid.token";

        assertFalse(jwtUtil.validateToken(invalidToken));
    }

    @Test
    void testIsTokenValid_WrongEmail() {
        String token = jwtUtil.generateAccessToken("test@example.com", "USER", "user-1", "profile-1", null);
        assertFalse(jwtUtil.isTokenValid(token, "wrong@example.com"));
    }

    @Test
    void testGetRemainingSeconds() {
        String token = jwtUtil.generateAccessToken("test@example.com", "USER", "user-1", "profile-1", null);
        long remaining = jwtUtil.getRemainingSeconds(token);

        // It should be close to 3600 seconds
        assertTrue(remaining > 3500 && remaining <= 3600);
    }

    @Test
    void testExpiredToken() throws InterruptedException {
        // Create an instance with very short expiration time (-1000ms to expire
        // immediately in the past instead of Thread.sleep which might be flaky)
        JwtUtil expiredJwtUtil = new JwtUtil(secretKey, -1000, -1000);
        String token = expiredJwtUtil.generateAccessToken("test@example.com", "USER", "user-1", "profile-1", null);

        assertFalse(expiredJwtUtil.validateToken(token));
        assertThrows(ExpiredJwtException.class, () -> expiredJwtUtil.isTokenValid(token, "test@example.com"));
        assertThrows(ExpiredJwtException.class, () -> expiredJwtUtil.extractClaims(token));
        assertThrows(ExpiredJwtException.class, () -> expiredJwtUtil.isTokenExpired(token));
    }
}
