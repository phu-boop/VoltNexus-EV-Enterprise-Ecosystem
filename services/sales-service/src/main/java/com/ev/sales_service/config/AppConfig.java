package com.ev.sales_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.ev.common_lib.exception.ErrorCode;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    //private final GatewayHeaderFilter gatewayHeaderFilter;
//    public AppConfig(GatewayHeaderFilter gatewayHeaderFilter) {
//        this.gatewayHeaderFilter = gatewayHeaderFilter;
//    }
//
//    // Bean RestTemplate để gọi HTTP request
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//
//        http
//            .csrf(csrf -> csrf.disable())
//            .authorizeHttpRequests(auth -> auth
//                .anyRequest().permitAll()
//            )
//            .exceptionHandling(ex -> ex.accessDeniedHandler((request, response, accessDeniedException) -> {
//                response.setStatus(ErrorCode.FORBIDDEN.getHttpStatus().value());
//                response.setContentType("application/json");
//                String body = String.format("{\"code\":\"%s\",\"message\":\"%s\"}",
//                        ErrorCode.FORBIDDEN.getCode(),
//                        ErrorCode.FORBIDDEN.getMessage());
//                response.getWriter().write(body);
//            }));
//            //.addFilterBefore(gatewayHeaderFilter, UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }

}
