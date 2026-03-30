package com.example.reporting_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Tắt CSRF (vì chúng ta dùng JWT, không dùng session)
                .csrf(csrf -> csrf.disable())

                // 2. Tắt CORS (Gateway của bạn sẽ xử lý CORS)
                .cors(cors -> cors.disable())

                // 3. Cho phép tất cả mọi request đi qua
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}
