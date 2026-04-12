package com.ev.sales_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration; 
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
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
public class SalesServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SalesServiceApplication.class, args);
    }
}