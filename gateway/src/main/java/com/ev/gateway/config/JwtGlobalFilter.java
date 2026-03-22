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
            "/auth",
            "/users",
            "/oauth2", // OAuth2 authentication flow
            "/login", // OAuth2 login callback
            "/sendmail",
            "/ws",
            "/payments/payment/return",
            "/payments/payment/ipn",
            "/payments/payment/pay-url",
            "/payments/api/v1/payments/gateway/callback/vnpay-return",
            "/payments/api/v1/payments/gateway/callback/vnpay-ipn",
            "/favicon.ico",
            // Vehicle service endpoints (after rewrite)
            "/vehicle-catalog",
            "/variants",
            "/models",
            // Vehicle service endpoints (before rewrite)
            "/vehicles/vehicle-catalog",
            "/vehicles/variants",
            "/vehicles/models",
            // Sales service endpoints (after rewrite)
            "/promotions/active",
            // Sales service endpoints (before rewrite)
            "/sales/promotions/active",
            // Cart endpoints
            "/cart",
            // Dealer service endpoints
            "/dealers",
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

        String email = jwtUtil.extractEmail(token);

        // Kiểm tra tính hợp lệ của token
        if (!jwtUtil.isTokenValid(token, email)) {
            log.warn("[JwtGlobalFilter] Token invalid for email: {} | Path: {}", email, path);
            return this.onError(exchange, ErrorCode.TOKEN_INVALID);
        }

        // Trích xuất các claims từ JWT
        String role = jwtUtil.extractRole(token);
        Long userId = jwtUtil.extractUserId(token);
        String profileId = jwtUtil.extractProfileId(token);
        String dealerId = jwtUtil.extractDealerId(token);

        logAuthenticationSuccess(path, email, role, userId, profileId);

        // Gắn thông tin người dùng vào header và chuyển tiếp request
        ServerWebExchange mutatedExchange = mutateExchangeWithUserHeaders(exchange, email, role, userId, profileId,
                dealerId, path);
        return chain.filter(mutatedExchange);
    }

    private void logAuthenticationSuccess(String path, String email, String role, Long userId, String profileId) {
        if (path.startsWith("/payments")) {
            log.debug(
                    "[JwtGlobalFilter] [PAYMENT_SERVICE] Authentication successful - Path: {} | Email: {} | Role: {} | UserId: {} | ProfileId: {}",
                    path, email, role, userId, profileId);
        }
        log.info("[JwtGlobalFilter] Extracted from JWT - Path: {} | Email: {} | Role: {} | UserId: {} | ProfileId: {}",
                path, email, role, userId, profileId);
    }

    private ServerWebExchange mutateExchangeWithUserHeaders(ServerWebExchange exchange, String email, String role,
            Long userId, String profileId, String dealerId, String path) {
        return exchange.mutate()
                .request(r -> r.headers(headers -> {
                    headers.add("X-User-Email", email);
                    headers.add("X-User-Role", role);
                    headers.add("X-User-Id", String.valueOf(userId));
                    headers.add("X-User-ProfileId", profileId);
                    if (dealerId != null) {
                        headers.add("X-User-DealerId", dealerId);
                    }
                    if (exchange.getRequest().getRemoteAddress() != null) {
                        headers.add("X-Forwarded-For",
                                exchange.getRequest().getRemoteAddress().getAddress().getHostAddress());
                    }

                    logHeaderAddition(path, email, role, userId, profileId, dealerId);
                }))
                .build();
    }

    private void logHeaderAddition(String path, String email, String role, Long userId, String profileId,
            String dealerId) {
        if (path.startsWith("/payments")) {
            log.debug(
                    "[JwtGlobalFilter] [PAYMENT_SERVICE] Added headers to request - X-User-Email: {}, X-User-Role: {}, X-User-Id: {}, X-User-ProfileId: {}, X-User-DealerId: {}",
                    email, role, userId, profileId, dealerId);
        } else {
            log.debug("[JwtGlobalFilter] Added headers - X-User-Email: {}, X-User-Role: {}, X-User-ProfileId: {}",
                    email, role, profileId);
        }
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

        String body = String.format("{\"code\":\"%s\",\"message\":\"%s\",\"data\":null}", code, message);
        byte[] bytes = body.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return response.writeWith(Mono.just(response.bufferFactory().wrap(bytes)));
    }
}
