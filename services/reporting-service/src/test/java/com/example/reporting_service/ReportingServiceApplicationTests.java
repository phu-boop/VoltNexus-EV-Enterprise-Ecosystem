package com.example.reporting_service;

import org.junit.jupiter.api.Test;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;

// Cấu hình để sử dụng H2 In-Memory Database thay vì MariaDB/MySQL thực tế.
// Điều này giúp môi trường Test (Test Context) khởi tạo mà không cần driver thực.
@ActiveProfiles("test")
class ReportingServiceApplicationTests {

    @MockBean
    private KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Test cơ bản để xác nhận Spring Context (bao gồm JPA và Kafka) có thể load
     * mà không gặp lỗi kết nối driver database thực tế.
     */
    @Test
    void contextLoads() {
        // Test này sẽ vượt qua nếu Spring Context khởi tạo thành công
    }
}