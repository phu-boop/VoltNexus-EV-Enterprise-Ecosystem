package com.example.reporting_service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import static org.assertj.core.api.Assertions.assertThat;


import org.junit.jupiter.api.Test;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.kafka.core.KafkaTemplate;

import static org.junit.jupiter.api.Assertions.assertNotNull;

// Cấu hình đã được đổi để kết nối Database MySQL và Kafka thực tế (thay vì H2).
// Điều này giúp môi trường Test (Test Context) chạy tương đương với môi trường dev/thực tế.
@SpringBootTest
@ActiveProfiles("test")
class ReportingServiceApplicationTests {

    @MockitoBean
    private KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Test cơ bản để xác nhận Spring Context (bao gồm JPA và Kafka) có thể load
     * mà không gặp lỗi kết nối driver database thực tế.
     */
    @Autowired
    private ApplicationContext context;

    @Test
    void contextLoads() {
        assertThat(context).isNotNull();
    }
}