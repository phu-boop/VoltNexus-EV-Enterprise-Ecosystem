package com.example.reporting_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

// Cấu hình để sử dụng H2 In-Memory Database thay vì MariaDB/MySQL thực tế.
// Điều này giúp môi trường Test (Test Context) khởi tạo mà không cần driver thực.
@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb", // Dùng H2 DB ảo
    "spring.datasource.driver-class-name=org.h2.Driver", // Dùng H2 driver
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect", // H2 dialect
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@ActiveProfiles("test") 
class ReportingServiceApplicationTests {

    /**
     * Test cơ bản để xác nhận Spring Context (bao gồm JPA và Kafka) có thể load 
     * mà không gặp lỗi kết nối driver database thực tế.
     */
    @Test
    void contextLoads() {
        // Test này sẽ vượt qua nếu Spring Context khởi tạo thành công
    }
}