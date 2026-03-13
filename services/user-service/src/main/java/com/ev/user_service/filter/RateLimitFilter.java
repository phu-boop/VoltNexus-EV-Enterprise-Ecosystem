package com.ev.user_service.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.ev.common_lib.exception.ErrorCode;

import java.io.IOException;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    private Bucket resolveBucket(String apiKey) {
        return cache.computeIfAbsent(apiKey, k -> {
            Refill refill = Refill.intervally(50, Duration.ofSeconds(10));
            Bandwidth limit = Bandwidth.classic(50, refill); // Tăng sức chứa tối đa của bucket lên 50
            return Bucket.builder().addLimit(limit).build();
        });
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String apiKey = request.getRemoteAddr();
        Bucket bucket = resolveBucket(apiKey);

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            // Set status
            response.setStatus(ErrorCode.TOO_MANY_REQUESTS.getHttpStatus().value());
            response.setContentType("application/json;charset=UTF-8");

            // Build JSON body
            Map<String, Object> body = new HashMap<>();
            body.put("code", ErrorCode.TOO_MANY_REQUESTS.getCode());
            body.put("message", ErrorCode.TOO_MANY_REQUESTS.getMessage());

            // Ghi JSON ra response
            response.getWriter().write(new ObjectMapper().writeValueAsString(body));
        }
    }
}
