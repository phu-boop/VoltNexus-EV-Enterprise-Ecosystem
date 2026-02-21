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
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/actuator/health",

                                // user-service
                                "/auth/**",
                                "/users/**",
                                "/oauth2/**",  // OAuth2 authentication flow
                                "/login/**",   // OAuth2 login callback

                                // customer-service
                                "/customers/**",
                                "/cart/**", // Cart endpoints
                                "/test-drives/**",
                                "/feedback/**",
                                "/complaints/**",
                                "/charging-stations/**",

                                // dealer-service
                                "/dealers/**",

                                // inventory-service
                                "/inventory/**",

                                // payment-service
                                "/payments/**",
                                "/api/v1/payments/**",
                                "/favicon.ico",
                                "/api/v1/payments/gateway/callback/vnpay-return",
                                "/api/v1/payments/gateway/callback/vnpay-ipn",

                                // "/sales/**"
                                "/sales/**",
                                "/orders/**",

                                "/sales-orders/**",
                                "/api/v1/sales-orders/**",

                                // vehicle-service
                                "/vehicles/**",

                                // reporting-service
                                "/reporting/**",

                                // sendmail
                                "/sendmail/customer-response/**",

                                "/ws/**",

                                // ai-service
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