package com.ev.customer_service.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        
        // Configure to skip null values and avoid deep copy of relationships
        modelMapper.getConfiguration()
                .setMatchingStrategy(MatchingStrategies.STRICT)
                .setSkipNullEnabled(true)
                .setAmbiguityIgnored(true);
        
        return modelMapper;
    }

    /**
     * RestTemplate bean để gọi các external services (User Service, Notification Service, etc.)
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
