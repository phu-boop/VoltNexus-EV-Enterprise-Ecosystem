package com.ev.payment_service.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;

@Configuration
public class RestTemplateConfig {

    /**
     * Định nghĩa một Bean RestTemplate duy nhất
     * và tiêm (inject) Interceptor của chúng ta vào.
     */
    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        // Thêm interceptor vào danh sách
        restTemplate.setInterceptors(Collections.singletonList(headerForwardingInterceptor()));
        return restTemplate;
    }

    /**
     * Interceptor này sẽ đọc tất cả các header từ request GỐC (từ Gateway)
     * và sao chép chúng vào request MỚI (gọi đến sales-service).
     */
    @Bean
    public ClientHttpRequestInterceptor headerForwardingInterceptor() {
        return new ClientHttpRequestInterceptor() {
            @Override
            public ClientHttpResponse intercept(HttpRequest request, byte[] body, ClientHttpRequestExecution execution) throws IOException {
                ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

                if (attributes != null) {
                    HttpServletRequest originalRequest = attributes.getRequest();
                    Enumeration<String> headerNames = originalRequest.getHeaderNames();

                    if (headerNames != null) {
                        while (headerNames.hasMoreElements()) {
                            String name = headerNames.nextElement();
                            // Chỉ sao chép các header ta cần
                            if (name.equalsIgnoreCase("Authorization") || name.startsWith("X-User-")) {
                                // Thêm header vào request mới (sắp được RestTemplate gửi đi)
                                request.getHeaders().add(name, originalRequest.getHeader(name));
                            }
                        }
                    }
                }
                // Thực thi request (gửi đi)
                return execution.execute(request, body);
            }
        };
    }
}