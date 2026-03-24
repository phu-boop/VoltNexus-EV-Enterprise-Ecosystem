package com.ev.inventory_service.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
import java.util.stream.Collectors;

@Component
public class GatewayHeaderFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(GatewayHeaderFilter.class);

    private static final String HEADER_EMAIL = "X-User-Email";
    private static final String HEADER_ROLE = "X-User-Role";
    private static final String HEADER_USER_ID = "X-User-Id";
    private static final String HEADER_PROFILE_ID = "X-User-ProfileId";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        logHeaders(request);

        String email = request.getHeader(HEADER_EMAIL);
        if (email == null || email.isEmpty()) {
            log.warn("{} header missing or empty for request to {}", HEADER_EMAIL, request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        if (isAlreadyAuthenticated()) {
            log.debug("SecurityContext already contains non-anonymous Authentication");
            filterChain.doFilter(request, response);
            return;
        }

        processAuthentication(request, email);
        filterChain.doFilter(request, response);
    }

    private void logHeaders(HttpServletRequest request) {
        log.debug("--- GatewayHeaderFilter: Received Headers for {} ---", request.getRequestURI());
        Collections.list(request.getHeaderNames())
                .forEach(headerName -> log.debug("{}: {}", headerName, request.getHeader(headerName)));
        log.debug("-------------------------------------------");
    }

    private boolean isAlreadyAuthenticated() {
        var currentAuth = SecurityContextHolder.getContext().getAuthentication();
        return currentAuth != null
                && !(currentAuth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken);
    }

    private void processAuthentication(HttpServletRequest request, String email) {
        log.debug("Setting SecurityContext for user: {}", email);

        String roleHeader = request.getHeader(HEADER_ROLE);
        List<GrantedAuthority> authorities = extractAuthorities(email, roleHeader);

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(email, null,
                authorities);
        authToken.setDetails(buildAuthDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authToken);
        log.info("Successfully authenticated user {} with roles {}", email, authorities);
    }

    private List<GrantedAuthority> extractAuthorities(String email, String roleHeader) {
        if (roleHeader == null || roleHeader.trim().isEmpty()) {
            log.warn("{} header is missing or empty for user: {}. Setting empty authorities.", HEADER_ROLE, email);
            return Collections.emptyList();
        }

        try {
            return Arrays.stream(roleHeader.split(","))
                    .map(String::trim)
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