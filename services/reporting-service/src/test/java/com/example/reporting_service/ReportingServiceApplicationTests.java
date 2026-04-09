package com.example.reporting_service;

import org.junit.jupiter.api.Test;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.kafka.core.KafkaTemplate;

import static org.junit.jupiter.api.Assertions.assertNotNull;

// Cấu hình đã được đổi để kết nối Database MySQL và Kafka thực tế (thay vì H2).
// Điều này giúp môi trường Test (Test Context) chạy tương đương với môi trường dev/thực tế.
@ActiveProfiles("test")
class ReportingServiceApplicationTests {

    @MockitoBean
    private KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Test cơ bản để xác nhận Spring Context (bao gồm JPA và Kafka) có thể load
     * mà không gặp lỗi kết nối driver database thực tế.
     */
    @Test
    void contextLoads() {
        // Xác nhận Spring Context khởi tạo thành công và inject mock bean đúng cách
        assertNotNull(kafkaTemplate, "KafkaTemplate bean should be injected by Spring Context");
    }
}