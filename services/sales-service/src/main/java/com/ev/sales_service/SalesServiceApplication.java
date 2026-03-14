package com.ev.sales_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
// ===== THÊM IMPORT NÀY =====
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration; 
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

// ... (Các import khác cho Security, CORS, v.v.) ...
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


@SpringBootApplication(
    scanBasePackages = {
        "com.ev.sales_service",
        "com.ev.common_lib"
    },
    // ===== SỬA LẠI DÒNG NÀY =====
    exclude = { UserDetailsServiceAutoConfiguration.class } 
)
@EnableFeignClients(basePackages = "com.ev.sales_service.client")
@EnableScheduling
@EnableTransactionManagement
@EnableWebSecurity
public class SalesServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SalesServiceApplication.class, args);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .cors(cors -> cors.disable()) 

            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/ws", "/ws/**").permitAll()
                .anyRequest().permitAll()
            );

        return http.build();
    }
}