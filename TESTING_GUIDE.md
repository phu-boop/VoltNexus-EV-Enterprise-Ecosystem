# 🚀 Kế Hoạch Phân Chia Viết Unit Test (SonarCloud Coverage)

Dựa trên danh sách các file chưa có coverage từ SonarCloud, chúng ta sẽ chia đều công việc cho **7 thành viên** trong team. Mục tiêu là đạt độ bao phủ (coverage) **≥ 80%** cho các logic quan trọng.

---

## 📅 Bảng Phân Chia Nhiệm Vụ (Task Assignment)

| Thành viên | Service / Module | Các file đảm nhiệm |
| :--- | :--- | :--- |
| **Member 1** | **Customer Service** | `TestDriveController`, `TestDriveService`, `TestDriveNotificationService`, `TestDriveSpecification` |
| **Member 2** | **Customer Service** | `ComplaintService`, `CustomerService`, `StaffAssignmentService`, `VehicleReviewService` |
| **Member 3** | **Customer Service** | `AppointmentConfirmationScheduler`, `EmailConfirmationService`, `LenientLongDeserializer`, `UserServiceClient` |
| **Member 4** | **AI Service** | `DemandForecastService`, `KnowledgeBaseLoader`, `ProductionPlanController`, `ProductionPlanService`, `TestController` |
| **Member 5** | **Inventory Service** | `InventoryServiceImpl`, `GatewayHeaderFilter`, `ProductionSecurityConfig` |
| **Member 6** | **Gateway & User** | `GatewayExceptionHandler` (Gateway), `JwtGlobalFilter` (Gateway), `OAuth2LoginSuccessHandler` (User) |
| **Member 7** | **Others** | `ImageService` (Vehicle), `HeaderConstants` (Common), `CartServiceImpl` (Bảo trì/Review lại) |

---

## 🛠️ Hướng Dẫn Viết Unit Test Của Team

### 1. Nguyên tắc "3 KHÔNG" khi viết Unit Test
1. **KHÔNG** dùng `@SpringBootTest`: Nó sẽ khởi động toàn bộ Server/Database/Kafka khiến test chạy chậm và hay bị lỗi kết nối trên CI (GitHub Actions).
2. **KHÔNG** kết nối Database thật: Luôn dùng **Mockito** để giả lập (Mock) các Repository.
3. **KHÔNG** test các Entity/DTO đơn giản: Chỉ tập trung test logic xử lý dữ liệu, tính toán, validate.

### 2. Quy tắc đặt tên file và vị trí
File test phải nằm trong thư mục `src/test/java` và có cấu trúc package **y hệt** file gốc.
- **File gốc:** `src/main/java/com/ev/customer_service/service/impl/XYZServiceImpl.java`
- **File test:** `src/test/java/com/ev/customer_service/service/impl/XYZServiceImplTest.java`

---

## 💡 Ví Dụ Mẫu (Dựa trên CartServiceImplTest)

Dưới đây là khung chuẩn cho một class test sử dụng **JUnit 5** và **Mockito**:

```java
package com.ev.customer_service.service.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

@ExtendWith(MockitoExtension.class) // Kích hoạt Mockito
class YourServiceTest {

    @Mock
    private YourRepository repository; // Giả lập repo

    @InjectMocks
    private YourServiceImpl service; // Inject các mock vào class service cần test

    @Test
    void testLogic_Success() {
        // 1. GIVEN (Chuẩn bị dữ liệu và hành động của Mock)
        when(repository.findById(1L)).thenReturn(Optional.of(new Entity()));

        // 2. WHEN (Gọi method cần test)
        var result = service.doSomething(1L);

        // 3. THEN (Kiểm tra kết quả)
        assertThat(result).isNotNull();
        verify(repository, times(1)).findById(1L); // Kiểm tra repo có được gọi không
    }
}
```

---

## 📈 Quy Trình Kiểm Tra Trước Khi Push
1. Chạy lệnh tại thư mục gốc service: `mvn clean test`
2. Kiểm tra xem có file `target/site/jacoco/index.html` không.
3. Mở file đó lên để xem % coverage của file mình vừa viết.
4. Nếu OK (màu xanh lá) thì hãy push lên GitHub.

---
*Người soạn: Antigravity AI*





