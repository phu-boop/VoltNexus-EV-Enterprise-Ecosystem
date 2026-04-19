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
@Profile("dev") // <-- CHỈ HOẠT ĐỘNG KHI PROFILE LÀ "dev"
public class DevSecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public DevSecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Trong dev chỉ siết quyền cho create/update/delete model, phần còn lại vẫn permitAll.

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/vehicle-catalog/models")
                        .hasAnyAuthority("ROLE_EVM_STAFF", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/vehicle-catalog/models/**")
                        .hasAnyAuthority("ROLE_EVM_STAFF", "ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/vehicle-catalog/models/**")
                        .hasAnyAuthority("ROLE_EVM_STAFF", "ROLE_ADMIN")
                        .requestMatchers("/api/vehicle/**").permitAll()
                        .anyRequest().permitAll())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
