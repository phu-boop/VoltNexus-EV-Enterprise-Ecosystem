# 6. Kubernetes và Điều phối Container (Container Orchestration)

## I. Tổng quan về Kubernetes (K8s)
Kubernetes là một nền tảng mã nguồn mở mang tính mở rộng cao, dùng để quản lý các ứng dụng được đóng gói trong container (containerized applications). Đối với một hệ thống Microservices phức tạp (như dự án Hệ sinh thái VoltNexus hiện tại với hơn 10 dịch vụ khác nhau: API Gateway, User, Customer, Dealer, Inventory... cùng hạ tầng Redis, Kafka), thao tác bật tắt thủ công từng container là bất khả thi. 
Kubernetes ra đời đóng vai trò là "Nhạc trưởng", tự động hóa việc triển khai (deployment), phát hiện lỗi và mở rộng quy mô (scaling) cho toàn bộ hệ sinh thái này.

## II. Các khái niệm cốt lõi theo đề tài
### 1. Pod
- **Khái niệm:** Pod là đơn vị cơ bản và nhỏ nhất trong Kubernetes. Một Pod là một nhóm gồm một hoặc nhiều container chia sẻ chung tài nguyên lưu trữ và IP nội bộ.
- **Áp dụng thực tế:** Trong dự án VoltNexus, mỗi dịch vụ nhỏ (như `user-service` hay `kafka`) sẽ chạy bên trong một Pod riêng biệt. Nếu ta cần 3 bản sao của `user-service` để gánh tải, K8s sẽ tạo ra 3 Pods chứa ứng dụng `user-service`.
- **Đặc điểm:** Pod là tài nguyên "phù du" (ephemeral), chúng có thể chết đi nếu bị lỗi mạng/RAM, và sẽ được K8s thay thế bằng một Pod mới toanh. Do đó, ta không gắn cứng IP để giao tiếp trực tiếp với Pod.

### 2. Deployment
- **Khái niệm:** Deployment là bộ phận quản lý cấp cao kiểm soát bao nhiêu Pods đang chạy. Nó cung cấp khả năng cập nhật theo kiểu tự khai báo (declarative updates).
- **Vai trò:** Bạn gửi một file YAML mô tả cho K8s: "Tôi muốn ứng dụng `gateway` luôn có 2 Pods hoạt động". Deployment Controller sẽ ghi nhận và làm mọi cách để duy trì trạng thái đó.
- **Tính năng nổi bật áp dụng vào dự án:**
  - **Self-healing (Tự phục hồi):** Giả sử Server bị đầy RAM làm chết Pod của `payment-service`, K8s phát hiện số lượng Pod bị tụt khỏi mức cam kết và tự đứng ra tạo lại một Pod `payment-service` khác ngay lập tức $\rightarrow$ Đảm bảo Zero-downtime.
  - **Auto/Manual Scaling (Giãn nở):** Kéo theo mùa sales, `sales-service` quá tải. Deployment cho phép tăng ngay số Pod lên 10 chỉ bằng 1 câu lệnh.
  - **Rolling Update:** Cập nhật phiên bản mới của hệ sinh thái từ từ, không cần bảo trì đánh sập toàn hệ thống.

### 3. Service
- **Khái niệm:** Do Pod thường xuyên sinh/diệt (IP thay đổi), Service đóng vai trò là một "trạm trung chuyển" mạng tĩnh để định tuyến (route) lưu lượng truy cập tới một cụm các Pod dựa trên (nhãn) Label.
- **Vai trò:** Service cung cấp một tên miền DNS nội bộ tĩnh (VD: IP của `redis-db` sẽ luôn truy cập được qua tên `redis-db`). Giúp `user-service` có thể dễ dàng gọi `kafka` hay `redis` mà không cần biết IP thật của Pod đằng sau là gì.
- **Các loại Service thường gặp:**
  - **ClusterIP (Mặc định):** Dùng để các Microservice trong hệ thống nói chuyện với nhau (Ví dụ: backend gọi qua Redis, hoặc Gateway gọi xuống User). Không cho bên ngoài cụm truy cập.
  - **NodePort:** Mở một cổng tĩnh trên các Server (Node) để ra ngoài.
  - **LoadBalancer (Đang dùng cho Gateway):** Kích hoạt cấp phát IP thật để cung cấp dịch vụ ra ngoài Internet. Toàn bộ người dùng ngoài web sẽ kết nối với K8s thông qua cổng Gateway (LoadBalancer) này, từ đó Gateway route requests vào các ClusterIP bên trong.
