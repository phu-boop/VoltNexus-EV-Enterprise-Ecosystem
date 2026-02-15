package com.ev.inventory_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Profile("docker")
public class ProductionSecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    public ProductionSecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // In môi trường dev, cho phép tất cả request đi qua

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/inventory/**")
                        .hasAnyRole("DEALER_STAFF", "DEALER_MANAGER", "EVM_STAFF", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/inventory/transactions")
                        .hasAnyAuthority("ROLE_EVM_STAFF", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/inventory/transactions")
                        .hasAnyAuthority("ROLE_EVM_STAFF", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/inventory/central-stock/**")
                        .hasAnyAuthority("ROLE_EVM_STAFF", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/inventory/allocate")
                        .hasAnyAuthority("ROLE_EVM_STAFF", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/inventory/ship-b2b")
                        .hasAnyAuthority("ROLE_EVM_STAFF", "ROLE_ADMIN")

                        // dealer
                        .requestMatchers(HttpMethod.GET, "/inventory/my-stock")
                        .hasAnyAuthority("ROLE_DEALER_MANAGER", "ROLE_DEALER_STAFF")
                        .requestMatchers(HttpMethod.PUT, "/inventory/dealer-stock/**")
                        .hasAnyAuthority("ROLE_DEALER_MANAGER")

                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}