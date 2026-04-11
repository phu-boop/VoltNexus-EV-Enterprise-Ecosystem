package com.ev.gateway.config;

import com.ev.common_lib.exception.ErrorCode;
import com.ev.gateway.util.JwtUtil;
import com.ev.gateway.service.RedisService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class JwtGlobalFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JwtGlobalFilter.class);
    private final JwtUtil jwtUtil;
    private final RedisService redisService;

    // Danh sách path được bỏ qua xác thực (không yêu cầu token)
    private static final List<String> EXCLUDED_PATHS = List.of(
            "/auth/login",
            "/auth/register/customer",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/auth/oauth2",
            "/oauth2", // OAuth2 authentication flow
            "/login", // OAuth2 login callback
            "/users/register/admin", // Bootstrap admin
            "/sendmail/customer-response",
            "/ws",
            "/payments/payment/return",
            "/payments/payment/ipn",
            "/payments/payment/pay-url",
            "/payments/api/v1/payments/gateway/callback/vnpay-return",
            "/payments/api/v1/payments/gateway/callback/vnpay-ipn",
            "/favicon.ico",
            // Public info (if any)
            "/charging-stations",
            "/vehicle-catalog",
            "/vehicles/public",
            "/ai/chat/ask",
            "/actuator/health",
            "/v3/api-docs",
            "/swagger-ui",
            // Sales service endpoints (before rewrite)
            "/sales/promotions/active",
            // Cart endpoints
            "/cart",
            // Customer service endpoints (public)
            "/customers/api/test-drives/public",
            "/customers/api/test-drives/public",
            "/test-drives/public",
            // AI Chatbot endpoint (Gateway handles rate limiting)
            "/ai/chat/ask");

    public JwtGlobalFilter(JwtUtil jwtUtil, RedisService redisService) {
        this.jwtUtil = jwtUtil;
        this.redisService = redisService;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        log.info("[JwtGlobalFilter] Incoming request: {} {}", exchange.getRequest().getMethod(), path);

        // 1. Luôn cho phép các request OPTIONS (dùng cho CORS) đi qua
        if (isPreflightRequest(exchange)) {
            log.info("[JwtGlobalFilter] OPTIONS request allowed: {}", path);
            return chain.filter(exchange);
        }

        // 2. Path được bỏ qua xác thực
        if (isPathExcluded(path)) {
            log.info("[JwtGlobalFilter] Path excluded from authentication: {}", path);
            return chain.filter(exchange);
        }

        log.debug("[JwtGlobalFilter] Path requires authentication: {}", path);

        // 3. Kiểm tra Authorization header
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("[JwtGlobalFilter] Missing or invalid Authorization header for path: {}", path);
            return this.onError(exchange, ErrorCode.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);
        try {
            return processTokenAndChain(exchange, chain, token, path);
        } catch (ExpiredJwtException e) {
            log.warn("[JwtGlobalFilter] Token expired for path: {} | Error: {}", path, e.getMessage());
            return this.onError(exchange, ErrorCode.TOKEN_EXPIRED);
        } catch (JwtException e) {
            log.error("[JwtGlobalFilter] JWT exception for path: {} | Error: {}", path, e.getMessage(), e);
            return this.onError(exchange, ErrorCode.TOKEN_INVALID);
        }
    }

    private boolean isPreflightRequest(ServerWebExchange exchange) {
        return exchange.getRequest().getMethod() == HttpMethod.OPTIONS;
    }

    private boolean isPathExcluded(String path) {
        return EXCLUDED_PATHS.stream().anyMatch(path::startsWith);
    }

    private Mono<Void> processTokenAndChain(ServerWebExchange exchange, GatewayFilterChain chain, String token,
            String path) {
        // Kiểm tra blacklist (đã đăng xuất)
        if (redisService.contains(token)) {
            log.warn("[JwtGlobalFilter] Token found in blacklist (logged out) for path: {}", path);
            return this.onError(exchange, ErrorCode.TOKEN_LOGGED_OUT);
        }

        try {
            String email = jwtUtil.extractEmail(token);

            // Kiểm tra tính hợp lệ của token
            if (!jwtUtil.isTokenValid(token, email)) {
                log.warn("[JwtGlobalFilter] Token invalid for email: {} | Path: {}", email, path);
                return this.onError(exchange, ErrorCode.TOKEN_INVALID);
            }

            // Trích xuất các claims từ JWT
            String role = jwtUtil.extractRole(token);
            String userId = jwtUtil.extractUserId(token);
            String profileId = jwtUtil.extractProfileId(token);
            String dealerId = jwtUtil.extractDealerId(token);

            // Ghi log thành công
            logAuthenticationSuccess(email, role, userId, profileId, dealerId);

            // Mutate Request với các headers thông tin User
            ServerWebExchange mutatedExchange = mutateExchangeWithUserHeaders(exchange, email, role, userId, profileId,
                    dealerId, token);

            // Populate Authentication cho WebFlux SecurityContext
            List<SimpleGrantedAuthority> authorities = (role != null && !role.trim().isEmpty())
                    ? List.of(new SimpleGrantedAuthority(role))
                    : List.of();
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(email, null, authorities);

            return chain.filter(mutatedExchange)
                    .contextWrite(ReactiveSecurityContextHolder.withAuthentication(auth));

        } catch (ExpiredJwtException e) {
            log.warn("[JwtGlobalFilter] Token expired for path: {} | Error: {}", path, e.getMessage());
            return this.onError(exchange, ErrorCode.TOKEN_EXPIRED);
        } catch (RuntimeException e) {
            log.warn("[JwtGlobalFilter] Token invalid for path: {} | Error: {}", path, e.getMessage());
            return this.onError(exchange, ErrorCode.TOKEN_INVALID);
        }
    }

    private void logAuthenticationSuccess(String email, String role, String userId, String profileId, String dealerId) {
        log.info("JWT Validation Success - User: {}, Role: {}, ID: {}, Profile: {}, Dealer: {}",
                email, role, userId, profileId, dealerId);
    }

    private ServerWebExchange mutateExchangeWithUserHeaders(ServerWebExchange exchange, String email, String role,
            String userId, String profileId, String dealerId, String token) {
        return exchange.mutate()
                .request(r -> r
                        .header("X-User-Email", email)
                        .header("X-User-Role", role)
                        .header("X-User-Id", userId != null ? userId : "")
                        .header("X-User-ProfileId", profileId != null ? profileId : "")
                        .header("X-User-DealerId", dealerId != null ? dealerId : "")
                        .header("Authorization", "Bearer " + token))
                .build();
    }

    @Override
    public int getOrder() {
        return -1; // chạy sớm nhất
    }

    private Mono<Void> onError(ServerWebExchange exchange, ErrorCode errorCode) {
        return onError(exchange, errorCode.getCode(), errorCode.getMessage(), errorCode.getHttpStatus());
    }

    private Mono<Void> onError(ServerWebExchange exchange, String code, String message, HttpStatus httpStatus) {
        var response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().add("Content-Type", "application/json; charset=UTF-8");

        String body = String.format("{\"timestamp\":\"%s\",\"code\":\"%s\",\"message\":\"%s\",\"data\":null}",
                java.time.Instant.now(), code, message);
        byte[] bytes = body.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return response.writeWith(Mono.just(response.bufferFactory().wrap(bytes)));
    }
}
