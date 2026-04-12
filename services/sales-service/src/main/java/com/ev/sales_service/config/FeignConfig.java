package com.ev.sales_service.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {

    private final SecurityHeaderInterceptor securityHeaderInterceptor;

    public FeignConfig(SecurityHeaderInterceptor securityHeaderInterceptor) {
        this.securityHeaderInterceptor = securityHeaderInterceptor;
    }

    @Bean
    public RequestInterceptor requestInterceptor() {
        return securityHeaderInterceptor;
    }
}
