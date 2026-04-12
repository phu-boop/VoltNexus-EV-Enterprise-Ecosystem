package com.ev.sales_service.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableCaching
public class AppConfig {

    private final SecurityHeaderInterceptor securityHeaderInterceptor;

    public AppConfig(SecurityHeaderInterceptor securityHeaderInterceptor) {
        this.securityHeaderInterceptor = securityHeaderInterceptor;
    }

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getInterceptors().add(securityHeaderInterceptor);
        return restTemplate;
    }
}
