package com.ev.gateway.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.data.redis.core.ReactiveValueOperations;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GuestRateLimitGatewayFilterFactoryTest {

    @Mock
    private ReactiveStringRedisTemplate redisTemplate;

    @Mock
    private ReactiveValueOperations<String, String> valueOperations;

    @Mock
    private GatewayFilterChain chain;

    private GuestRateLimitGatewayFilterFactory factory;
    private GatewayFilter filter;

    @BeforeEach
    void setUp() {
        factory = new GuestRateLimitGatewayFilterFactory(redisTemplate);
        filter = factory.apply(new GuestRateLimitGatewayFilterFactory.Config());
    }

    @Test
    void filter_AuthenticatedRequest_ShouldSkipRateLimit() {
        ServerWebExchange exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/")
                .header(HttpHeaders.AUTHORIZATION, "Bearer token").build());
        
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        Mono<Void> result = filter.filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();
        verify(chain).filter(exchange);
        verifyNoInteractions(redisTemplate);
    }

    @Test
    void filter_GuestRequest_UnderLimit_ShouldProceed() {
        String clientIp = "127.0.0.1";
        ServerWebExchange exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/")
                .remoteAddress(new java.net.InetSocketAddress(clientIp, 80)).build());

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(anyString())).thenReturn(Mono.just(1L));
        when(redisTemplate.expire(anyString(), any(Duration.class))).thenReturn(Mono.just(true));
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        Mono<Void> result = filter.filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();
        verify(chain).filter(exchange);
    }

    @Test
    void filter_GuestRequest_OverLimit_ShouldReturnTooManyRequests() {
        String clientIp = "127.0.0.1";
        ServerWebExchange exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/")
                .remoteAddress(new java.net.InetSocketAddress(clientIp, 80)).build());

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(anyString())).thenReturn(Mono.just(51L)); // Over 50

        Mono<Void> result = filter.filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, exchange.getResponse().getStatusCode());
        verifyNoInteractions(chain);
    }

    @Test
    void filter_WithXForwardedForHeader_ShouldUseFirstIp() {
        String xForwardedFor = "192.168.1.1, 10.0.0.1";
        ServerWebExchange exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/")
                .header("X-Forwarded-For", xForwardedFor).build());

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment(eq("guest_chat_limit:192.168.1.1"))).thenReturn(Mono.just(1L));
        when(redisTemplate.expire(anyString(), any(Duration.class))).thenReturn(Mono.just(true));
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        Mono<Void> result = filter.filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();
        verify(valueOperations).increment("guest_chat_limit:192.168.1.1");
    }
}
