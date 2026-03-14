package com.ev.vehicle_service.config;

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
                        .requestMatchers(HttpMethod.GET, "/vehicle-models/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/vehicle-models")
                        .hasAnyAuthority("ROLE_EVM_STAFF", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/vehicle-models/**")
                        .hasAnyAuthority("ROLE_EVM_STAFF", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/vehicle-models/**")
                        .hasAnyAuthority("ROLE_EVM_STAFF", "ROLE_ADMIN")
                        .requestMatchers("/vehicle-catalog/**").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}