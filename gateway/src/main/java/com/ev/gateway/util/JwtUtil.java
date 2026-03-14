package com.ev.gateway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private final String SECRET_KEY;
    private final long ACCESS_EXPIRATION_MS;
    private final long REFRESH_EXPIRATION_MS;

    public JwtUtil(
            @Value("${jwt.secret-key}") String secretKey,
            @Value("${jwt.access-expiration-ms}") long accessExpirationMs,
            @Value("${jwt.refresh-expiration-ms}") long refreshExpirationMs
    ) {
        this.SECRET_KEY = secretKey;
        this.ACCESS_EXPIRATION_MS = accessExpirationMs;
        this.REFRESH_EXPIRATION_MS = refreshExpirationMs;
    }

    // ============================================================
    // 🔍 Extract Claims
    // ============================================================
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .setSigningKey(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    public Long extractUserId(String token) {
        Object userIdObj = extractClaims(token).get("userId");
        if (userIdObj instanceof Integer) {
            return ((Integer) userIdObj).longValue();
        }
        return userIdObj != null ? Long.parseLong(userIdObj.toString()) : null;
    }

    public String extractProfileId(String token) {
        return extractClaims(token).get("profileId", String.class);
    }

    public String extractDealerId(String token) {
        return extractClaims(token).get("dealerId", String.class);
    }

    // ============================================================
    // 🧩 Validation
    // ============================================================
    public boolean isTokenValid(String token, String email) {
        String tokenEmail = extractEmail(token);
        return tokenEmail.equals(email) && !isTokenExpired(token);
    }

    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    public long getRemainingSeconds(String token) {
        Date expiration = extractClaims(token).getExpiration();
        return (expiration.getTime() - System.currentTimeMillis()) / 1000;
    }
}
