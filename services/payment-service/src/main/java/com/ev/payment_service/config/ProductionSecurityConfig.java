package com.ev.payment_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@Profile("!dev")
public class ProductionSecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public ProductionSecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/methods/active-public").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/customer/debug-me", "/favicon.ico").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/gateway/callback/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments/gateway/callback/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments/gateway/initiate-b2c").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/customer/my-deposits").permitAll()
                        .requestMatchers(HttpMethod.GET, "/payment/**").permitAll()
                        .requestMatchers("/payment/return").permitAll()
                        .requestMatchers("/favicon.ico").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
