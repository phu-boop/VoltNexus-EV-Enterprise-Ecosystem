package com.ev.gateway.config;

import com.ev.gateway.service.RedisService;
import com.ev.gateway.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtGlobalFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private RedisService redisService;

    @Mock
    private GatewayFilterChain chain;

    @InjectMocks
    private JwtGlobalFilter jwtGlobalFilter;

    private ServerWebExchange exchange;

    @BeforeEach
    void setUp() {
        // Initialize common mocks or data if needed
    }

    @Test
    void filter_ExcludedPath_ShouldProceed() {
        exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/auth/login").build());
        when(chain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());

        Mono<Void> result = jwtGlobalFilter.filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();
        verify(chain).filter(exchange);
        verifyNoInteractions(jwtUtil);
    }

    @Test
    void filter_MissingToken_ShouldReturnUnauthorized() {
        exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/api/inventory").build());

        Mono<Void> result = jwtGlobalFilter.filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
        verifyNoInteractions(chain);
    }

    @Test
    void filter_InvalidToken_ShouldReturnUnauthorized() {
        String token = "invalid-token";
        exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/api/inventory")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token).build());

        when(redisService.contains(token)).thenReturn(false);
        when(jwtUtil.extractEmail(token)).thenThrow(new RuntimeException("Invalid token"));

        Mono<Void> result = jwtGlobalFilter.filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }

    @Test
    void filter_ValidToken_ShouldPropagateHeaders() {
        String token = "valid-token";
        String email = "test@example.com";
        String role = "ADMIN";
        String userId = "user-123";

        exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/api/inventory")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token).build());

        when(redisService.contains(token)).thenReturn(false);
        when(jwtUtil.extractEmail(token)).thenReturn(email);
        when(jwtUtil.isTokenValid(token, email)).thenReturn(true);
        when(jwtUtil.extractRole(token)).thenReturn(role);
        when(jwtUtil.extractUserId(token)).thenReturn(userId);
        when(jwtUtil.extractProfileId(token)).thenReturn("profile-456");

        when(chain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());

        Mono<Void> result = jwtGlobalFilter.filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();

        ArgumentCaptor<ServerWebExchange> exchangeCaptor = ArgumentCaptor.forClass(ServerWebExchange.class);
        verify(chain).filter(exchangeCaptor.capture());

        ServerWebExchange capturedExchange = exchangeCaptor.getValue();
        assertEquals(email, capturedExchange.getRequest().getHeaders().getFirst("X-User-Email"));
        assertEquals(role, capturedExchange.getRequest().getHeaders().getFirst("X-User-Role"));
        assertEquals(userId, capturedExchange.getRequest().getHeaders().getFirst("X-User-Id"));
    }

    @Test
    void filter_BlacklistedToken_ShouldReturnUnauthorized() {
        String token = "blacklisted-token";
        exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/api/inventory")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token).build());

        when(redisService.contains(token)).thenReturn(true);

        Mono<Void> result = jwtGlobalFilter.filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
        verifyNoInteractions(jwtUtil);
        verifyNoInteractions(chain);
    }

    @Test
    void filter_OptionsRequest_ShouldProceed() {
        exchange = MockServerWebExchange.from(MockServerHttpRequest.options("/api/inventory").build());
        when(chain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());

        Mono<Void> result = jwtGlobalFilter.filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();
        verify(chain).filter(exchange);
        verifyNoInteractions(jwtUtil);
    }

    @Test
    void filter_MutateRequestWithNullIds() {
        String token = "valid-token";
        String email = "test@example.com";
        exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/api/inventory")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token).build());

        when(redisService.contains(token)).thenReturn(false);
        when(jwtUtil.extractEmail(token)).thenReturn(email);
        when(jwtUtil.isTokenValid(token, email)).thenReturn(true);
        when(jwtUtil.extractRole(token)).thenReturn("USER");
        when(jwtUtil.extractUserId(token)).thenReturn(null);
        when(jwtUtil.extractProfileId(token)).thenReturn(null);
        when(jwtUtil.extractDealerId(token)).thenReturn(null);
        when(chain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());

        Mono<Void> result = jwtGlobalFilter.filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();

        ArgumentCaptor<ServerWebExchange> exchangeCaptor = ArgumentCaptor.forClass(ServerWebExchange.class);
        verify(chain).filter(exchangeCaptor.capture());
        ServerWebExchange capturedExchange = exchangeCaptor.getValue();
        assertEquals("", capturedExchange.getRequest().getHeaders().getFirst("X-User-Id"));
        assertEquals("", capturedExchange.getRequest().getHeaders().getFirst("X-User-ProfileId"));
        assertEquals("", capturedExchange.getRequest().getHeaders().getFirst("X-User-DealerId"));
    }

    @Test
    void filter_ExpiredTokenInProcess_ShouldReturnUnauthorized() {
        String token = "expired-token";
        exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/api/inventory")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token).build());

        when(redisService.contains(token)).thenReturn(false);
        when(jwtUtil.extractEmail(token)).thenThrow(new io.jsonwebtoken.ExpiredJwtException(null, null, "Expired"));

        Mono<Void> result = jwtGlobalFilter.filter(exchange, chain);

        StepVerifier.create(result).verifyComplete();
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }
}
