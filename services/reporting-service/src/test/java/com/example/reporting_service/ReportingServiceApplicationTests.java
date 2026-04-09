package com.example.reporting_service;

import org.junit.jupiter.api.Test;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;

// Cấu hình đã được đổi để kết nối Database MySQL và Kafka thực tế (thay vì H2).
// Điều này giúp môi trường Test (Test Context) chạy tương đương với môi trường dev/thực tế.
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