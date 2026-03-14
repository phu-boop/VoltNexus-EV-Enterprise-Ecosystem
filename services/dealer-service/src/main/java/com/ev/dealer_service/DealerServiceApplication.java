package com.ev.dealer_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {
    "com.ev.dealer_service", 
    "com.ev.common_lib"       
})
public class DealerServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DealerServiceApplication.class, args);
    }

}
