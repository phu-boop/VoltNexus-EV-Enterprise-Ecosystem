package com.ev.payment_service.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        String email = request.getHeader("X-User-Email");
        String role = request.getHeader("X-User-Role");
        String profileIdHeader = request.getHeader("X-User-ProfileId");
        String dealerIdHeader = request.getHeader("X-User-DealerId");

        if (email != null && role != null) {
            String normalizedRole = normalizeRole(role);
            UserPrincipal principal = UserPrincipal.builder()
                    .email(email)
                    .role(normalizedRole)
                    .profileId(parseUuid(profileIdHeader))
                    .dealerId(parseUuid(dealerIdHeader))
                    .build();

            var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + normalizedRole));
            var auth = new UsernamePasswordAuthenticationToken(principal, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }

    private String normalizeRole(String role) {
        String normalized = role.trim().replace("[", "").replace("]", "").replace("\"", "");
        if (normalized.contains(",")) {
            normalized = normalized.split(",")[0].trim();
        }
        if (normalized.startsWith("ROLE_")) {
            normalized = normalized.substring(5);
        }
        return normalized;
    }

    private UUID parseUuid(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        try {
            return UUID.fromString(value.trim());
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
