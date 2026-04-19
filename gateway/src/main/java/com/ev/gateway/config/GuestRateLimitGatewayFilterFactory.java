package com.ev.gateway.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;

import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Objects;

@Component
@Slf4j
public class GuestRateLimitGatewayFilterFactory extends AbstractGatewayFilterFactory<GuestRateLimitGatewayFilterFactory.Config> {

    private final ReactiveStringRedisTemplate redisTemplate;
    // for testing collection
    private static final int MAX_REQUESTS = 50;
    private static final long WINDOW_TIME_MINUTES = 5;

    public GuestRateLimitGatewayFilterFactory(ReactiveStringRedisTemplate redisTemplate) {
        super(Config.class);
        this.redisTemplate = redisTemplate;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // Check if Authorization header is present
            if (request.getHeaders().containsKey("Authorization")) {
                // If authenticated, skip rate limiting
                return chain.filter(exchange);
            }

            // Get Client IP
            String clientIp = getClientIp(request);
            String redisKey = "guest_chat_limit:" + clientIp;

            return redisTemplate.opsForValue().increment(redisKey)
                    .flatMap(count -> {
                        if (count == 1) {
                            // First request, set expiration
                            return redisTemplate.expire(redisKey, Duration.ofMinutes(WINDOW_TIME_MINUTES))
                                    .thenReturn(count);
                        }
                        return Mono.just(count);
                    })
                    .flatMap(count -> {
                        if (count > MAX_REQUESTS) {
                            log.warn("Rate limit exceeded for guest IP: {}", clientIp);
                            ServerHttpResponse response = exchange.getResponse();
                            response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
                            return response.setComplete();
                        }
                        return chain.filter(exchange);
                    });
        };
    }

    private String getClientIp(ServerHttpRequest request) {
        // Handle proxy headers like X-Forwarded-For
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return Objects.requireNonNull(request.getRemoteAddress()).getAddress().getHostAddress();
    }

    public static class Config {
        // Configuration properties can be added here if needed
    }
}
