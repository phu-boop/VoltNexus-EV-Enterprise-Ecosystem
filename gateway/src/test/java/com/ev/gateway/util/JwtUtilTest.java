package com.ev.gateway.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String secretKey = "v0ltn3xus_3v_3nt3rpr1s3_3c0syst3m_s3cr3t_k3y_256_b1ts";
    private final long accessExpirationMs = 3600000;
    private final long refreshExpirationMs = 86400000;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(secretKey, accessExpirationMs, refreshExpirationMs);
    }

    private String createTestToken(String email, String role, String userId, Instant expiration) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("userId", userId);
        claims.put("profileId", "prof-456");
        claims.put("dealerId", "deal-789");

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(Date.from(expiration))
                .signWith(Keys.hmacShaKeyFor(secretKey.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    @Test
    void testExtractClaimsAndEmail() {
        String token = createTestToken("test@ev.com", "ADMIN", "user-123", Instant.now().plusSeconds(60));
        assertEquals("test@ev.com", jwtUtil.extractEmail(token));
        assertEquals("ADMIN", jwtUtil.extractRole(token));
        assertEquals("user-123", jwtUtil.extractUserId(token));
        assertEquals("prof-456", jwtUtil.extractProfileId(token));
        assertEquals("deal-789", jwtUtil.extractDealerId(token));
    }

    @Test
    void testIsTokenValid() {
        String token = createTestToken("test@ev.com", "USER", "123", Instant.now().plusSeconds(60));
        assertTrue(jwtUtil.isTokenValid(token, "test@ev.com"));
        assertFalse(jwtUtil.isTokenValid(token, "wrong@ev.com"));
    }

    @Test
    void testIsTokenExpired() {
        String expiredToken = createTestToken("test@ev.com", "USER", "123", Instant.now().minusSeconds(60));
        // Note: extractClaims will throw ExpiredJwtException if expired
        // But the method isTokenExpired calls extractClaims.
        // We should handle the exception if the method doesn't.
        // JwtUtil.isTokenExpired: return
        // extractClaims(token).getExpiration().before(new Date());

        assertThrows(io.jsonwebtoken.ExpiredJwtException.class, () -> jwtUtil.isTokenExpired(expiredToken));
    }

    @Test
    void testGetRemainingSeconds() {
        Instant expiration = Instant.now().plusSeconds(100);
        String token = createTestToken("test@ev.com", "USER", "123", expiration);
        long remaining = jwtUtil.getRemainingSeconds(token);
        assertTrue(remaining > 0 && remaining <= 100);
    }
}
