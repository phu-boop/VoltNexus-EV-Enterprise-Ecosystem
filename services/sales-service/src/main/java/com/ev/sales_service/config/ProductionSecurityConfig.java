package com.ev.sales_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
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
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .authorizeHttpRequests(auth -> auth
                        // ƯU TIÊN CAO NHẤT cho các đường dẫn public
                        .requestMatchers("/sendmail/customer-response/public/**", "/sendmail/**").permitAll()
                        .requestMatchers("/ws", "/ws/**", "/api/v1/quotations/public/**").permitAll()
                        .anyRequest().authenticated())
                .anonymous(anonymous -> anonymous.principal("anonymousUser").authorities("ROLE_ANONYMOUS"))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
