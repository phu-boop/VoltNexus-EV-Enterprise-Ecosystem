package com.ev.dealer_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class GatewayHeaderFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(GatewayHeaderFilter.class);

    private static final String HEADER_EMAIL = "X-User-Email";
    private static final String HEADER_ROLE = "X-User-Role";
    private static final String HEADER_USER_ID = "X-User-Id";
    private static final String HEADER_PROFILE_ID = "X-User-ProfileId";

    @Value("${jwt.secret-key}")
    private String secretKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        if (isAlreadyAuthenticated()) {
            log.debug("SecurityContext already contains non-anonymous Authentication");
            filterChain.doFilter(request, response);
            return;
        }

        String email = request.getHeader(HEADER_EMAIL);
        String roles = request.getHeader(HEADER_ROLE);

        if (email != null && !email.isEmpty()) {
            // Trường hợp 1: Request đến từ Gateway (có X-User-* headers)
            log.info("[GatewayHeaderFilter] Header {} found: {}. Roles: {}", HEADER_EMAIL, email, roles);
            log.debug("Authenticating via Gateway headers for user: {}", email);
            processGatewayHeaders(request, email);
        } else {
            // Trường hợp 2: Request gửi trực tiếp với Bearer token (Postman, test)
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                log.debug("Authenticating via JWT Bearer token");
                processJwtToken(request, token);
            } else {
                log.warn("No authentication found (no Gateway headers, no Bearer token) for: {}",
                        request.getRequestURI());
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAlreadyAuthenticated() {
        var currentAuth = SecurityContextHolder.getContext().getAuthentication();
        return currentAuth != null
                && !(currentAuth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken);
    }

    /**
     * Xử lý authentication từ Gateway headers (X-User-Email, X-User-Role, ...)
     */
    private void processGatewayHeaders(HttpServletRequest request, String email) {
        String roleHeader = request.getHeader(HEADER_ROLE);
        List<GrantedAuthority> authorities = extractAuthorities(email, roleHeader);

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(email, null,
                authorities);
        authToken.setDetails(buildAuthDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authToken);
        log.info("Authenticated via Gateway headers - user: {} with roles: {}", email, authorities);
    }

    /**
     * Xử lý authentication từ JWT Bearer token (gọi trực tiếp, không qua Gateway)
     */
    private void processJwtToken(HttpServletRequest request, String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(Keys.hmacShaKeyFor(secretKey.getBytes()))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            String email = claims.getSubject();
            String role = claims.get("role", String.class);
            String userId = claims.get("userId", String.class);
            String profileId = claims.get("profileId", String.class);

            if (email == null || email.isEmpty()) {
                log.warn("JWT token has no email (subject)");
                return;
            }

            List<GrantedAuthority> authorities = extractAuthorities(email, role);

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(email, null,
                    authorities);

            Map<String, String> details = new HashMap<>();
            if (userId != null) details.put("userId", userId);
            if (profileId != null) details.put("profileId", profileId);
            authToken.setDetails(details);

            SecurityContextHolder.getContext().setAuthentication(authToken);
            log.info("Authenticated via JWT token - user: {} with roles: {}", email, authorities);

        } catch (Exception e) {
            log.error("Failed to parse JWT token: {}", e.getMessage());
        }
    }

    private List<GrantedAuthority> extractAuthorities(String email, String roleHeader) {
        if (roleHeader == null || roleHeader.trim().isEmpty()) {
            log.warn("{} header is missing or empty for user: {}. Setting empty authorities.", HEADER_ROLE, email);
            return Collections.emptyList();
        }

        try {
            return Arrays.stream(roleHeader.split(","))
                    .map(String::trim)
                    .map(r -> r.replaceAll("[\\[\\]\"']", "")) // Clean any JSON formatting (brackets, quotes)
                    .filter(r -> !r.isEmpty())
                    .map(r -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + r.toUpperCase()))
                    .toList();
        } catch (Exception e) {
            log.error("Error parsing roles from header '{}': {}", roleHeader, e.getMessage());
            return Collections.emptyList();
        }
    }

    private Map<String, String> buildAuthDetails(HttpServletRequest request) {
        String userId = request.getHeader(HEADER_USER_ID);
        String profileId = request.getHeader(HEADER_PROFILE_ID);

        Map<String, String> details = new HashMap<>();
        if (userId != null)
            details.put("userId", userId);
        if (profileId != null)
            details.put("profileId", profileId);
        return details;
    }
}
