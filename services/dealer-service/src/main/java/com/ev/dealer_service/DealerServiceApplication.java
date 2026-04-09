package com.ev.dealer_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

@SpringBootApplication(scanBasePackages = {
    "com.ev.dealer_service", 
    "com.ev.common_lib"       
})
@ComponentScan(
    basePackages = {"com.ev.dealer_service", "com.ev.common_lib"},
    excludeFilters = @ComponentScan.Filter(
        type = FilterType.ASSIGNABLE_TYPE,
        classes = com.ev.common_lib.exception.GlobalExceptionHandler.class
    )
)
public class DealerServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DealerServiceApplication.class, args);
    }

}
