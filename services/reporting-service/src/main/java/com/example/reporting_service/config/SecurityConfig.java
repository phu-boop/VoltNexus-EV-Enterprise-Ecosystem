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
            // Hoặc bạn có thể cấu hình CORS tại đây nếu muốn
            .cors(cors -> cors.disable()) 
            
            // 3. VÔ HIỆU HÓA trang đăng nhập
            // Cho phép tất cả mọi request đi qua
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // <-- Tạm thời cho phép tất cả
            );

        return http.build();
    }
}
