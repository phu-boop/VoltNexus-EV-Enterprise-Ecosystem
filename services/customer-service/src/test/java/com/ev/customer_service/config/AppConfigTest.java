package com.ev.customer_service.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.modelmapper.ModelMapper;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;

class AppConfigTest {

    private AppConfig appConfig;

    @BeforeEach
    void setUp() {
        appConfig = new AppConfig();
    }

    @Test
    @DisplayName("ModelMapper bean creation and configuration")
    void modelMapper() {
        ModelMapper mapper = appConfig.modelMapper();
        assertNotNull(mapper);
        assertTrue(mapper.getConfiguration().isSkipNullEnabled());
        assertTrue(mapper.getConfiguration().isAmbiguityIgnored());
    }

    @Test
    @DisplayName("RestTemplate bean creation")
    void restTemplate() {
        RestTemplate restTemplate = appConfig.restTemplate();
        assertNotNull(restTemplate);
    }
}
