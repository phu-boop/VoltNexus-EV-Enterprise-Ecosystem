package com.ev.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfiguration;

import org.springframework.beans.factory.annotation.Value;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class SecurityConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Thêm cấu hình CORS
                .authorizeExchange(exchanges -> exchanges
                        // ===== Cho phép public routes =====
                        .pathMatchers(
                                "/",
                                "/error",
                                "/favicon.ico",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/actuator/health",

                                // Public endpoints (will also be excluded in JwtGlobalFilter)
                                "/auth/login",
                                "/auth/register/customer",
                                "/auth/forgot-password",
                                "/auth/reset-password",
                                "/auth/oauth2/**",
                                "/oauth2/**",
                                "/login/**",
                                "/users/register/admin",
                                "/sendmail/customer-response/**",
                                "/ws/**",
                                "/payments/payment/return",
                                "/payments/payment/ipn",
                                "/payments/payment/pay-url",
                                "/payments/api/v1/payments/gateway/callback/vnpay-return",
                                "/payments/api/v1/payments/gateway/callback/vnpay-ipn",

                                // Public resources
                                "/charging-stations/**",
                                "/vehicle-catalog/**",
                                "/vehicles/public/**",
                                "/ai/chat/ask",
                                // Public sales confirmation endpoints (pre-rewrite paths)
                                "/sales/api/v1/quotations/public/**",
                                "/sales/api/v1/orders/public/**",
                                "/sales/sendmail/customer-response/**",

                                // Allow all other service paths to reach JwtGlobalFilter/Downstream
                                // where they will be checked specifically
                                "/users/**",
                                "/customers/**",
                                "/cart/**",
                                "/test-drives/**",
                                "/feedback/**",
                                "/complaints/**",
                                "/dealers/**",
                                "/inventory/**",
                                "/payments/**",
                                "/sales/**",
                                "/orders/**",
                                "/sales-orders/**",
                                "/vehicles/**",
                                "/reporting/**",
                                "/ai/**")
                        .permitAll()

                        // ===== Các route khác cần JWT =====
                        .anyExchange().authenticated())
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                // Không tạo session
                .securityContextRepository(NoOpServerSecurityContextRepository.getInstance())
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfig = new CorsConfiguration();

        // Nhiều origin (tách bởi dấu phẩy)
        for (String origin : allowedOrigins.split(",")) {
            String trimmed = origin.trim();

            if (!trimmed.isEmpty()) {
                corsConfig.addAllowedOrigin(trimmed);

                // 👇 LOG RA
                System.out.println("✅ CORS allowed origin: " + trimmed);
            } else {
                System.out.println("⚠️ Found empty origin entry!");
            }
        }
        corsConfig.addAllowedMethod("*");
        corsConfig.addAllowedHeader("*");
        corsConfig.setAllowCredentials(true);
        corsConfig.setMaxAge(3600L);

        // Quan trọng: Hỗ trợ wildcard nếu cần
        corsConfig.addAllowedOriginPattern("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        return source;
    }

}