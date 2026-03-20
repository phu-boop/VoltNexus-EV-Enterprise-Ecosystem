package com.ev.user_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

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

    // Generate Access Token
    public String generateAccessToken(String email, String role, String profileId, String dealerId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("profileId", profileId);
        if (dealerId != null) {
            claims.put("dealerId", dealerId);
        }
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_EXPIRATION_MS))
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    // Generate Refresh Token
    public String generateRefreshToken(String email, String role, String profileId, String dealerId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("profileId", profileId);
        if (dealerId != null) {
            claims.put("dealerId", dealerId);
        }
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + REFRESH_EXPIRATION_MS))
                .signWith(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()), SignatureAlgorithm.HS256)
                .compact();
    }

    // Extract claims
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .setSigningKey(Keys.hmacShaKeyFor(SECRET_KEY.getBytes()))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Extract email
    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    // Extract role
    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    // Extract role
    public String extractProfileId(String token) {
        return extractClaims(token).get("profileId", String.class);
    }

    // Extract dealerId
    public String extractDealerId(String token) {
        return extractClaims(token).get("dealerId", String.class);
    }

    // Validate token
    public boolean validateToken(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Check if token is valid for specific user
    public boolean isTokenValid(String token, String email) {
        String tokenEmail = extractEmail(token);
        return tokenEmail.equals(email) && !isTokenExpired(token);
    }

    // Check if token expired
    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    // Get remaining seconds until expiration
    public long getRemainingSeconds(String token) {
        Date expiration = extractClaims(token).getExpiration();
        return (expiration.getTime() - System.currentTimeMillis()) / 1000;
    }
}
