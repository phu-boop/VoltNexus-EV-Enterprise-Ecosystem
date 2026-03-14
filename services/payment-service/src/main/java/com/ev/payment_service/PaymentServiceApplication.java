package com.ev.payment_service;

import com.ev.common_lib.exception.GlobalExceptionHandler; // << IMPORT
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import; // << IMPORT

@SpringBootApplication
@Import(GlobalExceptionHandler.class) // << THÊM DÒNG NÀY
public class PaymentServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(PaymentServiceApplication.class, args);
	}

}