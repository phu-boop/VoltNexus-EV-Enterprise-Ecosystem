package com.ev.payment_service.config;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Vẫn giữ để @PreAuthorize hoạt động
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    @Bean
    public HeaderAuthenticationFilter headerAuthenticationFilter() {
        log.info("[SecurityConfig] Creating HeaderAuthenticationFilter bean");
        return new HeaderAuthenticationFilter();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, HeaderAuthenticationFilter headerAuthenticationFilter) throws Exception {
        log.info("[SecurityConfig] Configuring SecurityFilterChain with HeaderAuthenticationFilter");

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // XÓA BỎ HOÀN TOÀN .oauth2ResourceServer()

                // THÊM FILTER MỚI CỦA CHÚNG TA VÀO TRƯỚC
                // Filter này sẽ đọc header và "xác thực" người dùng
                .addFilterBefore(headerAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                .authorizeHttpRequests(authorize -> authorize
                        // API public vẫn là permitAll
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/methods/active-public").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/customer/debug-me",
                                "/favicon.ico").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/v1/payments/gateway/callback/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/payments/gateway/callback/**").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/v1/payments/gateway/initiate-b2c").permitAll() 
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/customer/my-deposits").permitAll()
                        .requestMatchers(HttpMethod.GET, "/payment/**").permitAll()
                        .requestMatchers("/payment/return").permitAll()

                        // Bỏ qua favicon cho tất cả method
                        .requestMatchers("/favicon.ico").permitAll()
                        .anyRequest().authenticated()
                );

        log.info("[SecurityConfig] SecurityFilterChain configured successfully");
        return http.build();
    }

    // XÓA BỎ HOÀN TOÀN CÁC BEAN:
    // - jwtDecoder()
    // - jwtAuthenticationConverter()
    // Chúng không còn cần thiết nữa.
}