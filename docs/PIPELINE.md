# CI/CD Enterprise Pipeline - VoltNexus EV Ecosystem

## Workflow Architecture

### Phase 1: Quality & Security (CI)
1.  **Checkout Code**: Tải mã nguồn từ GitHub.
2.  **Build Common Library**: Build thư viện dùng chung (`common-lib`) để các Service khác có thể sử dụng.
3.  **Unit Testing**: Chạy toàn bộ Unit Test cho tất cả microservices (Sử dụng Mock Redis/Kafka/Firebase và H2 Database).
4.  **Static Analysis (SonarCloud)**: Phân tích chất lượng mã nguồn thực tế.
5.  **Quality Gate Check**: Tự động quét và đếm lỗi `BLOCKER` & `CRITICAL` từ SonarCloud API.
6.  **Security Scan (Trivy)**: Quét lỗ hổng bảo mật trong mã nguồn và dependencies.

### Phase 2: Orchestration & Dockerization
7.  **Containerize**: Build Docker images cho 10+ Microservices & Gateway.
8.  **Registry Push**: Đẩy Docker images lên Docker Hub (Chỉ dành cho nhánh `main`).
9.  **Staging Infrastructure**: Khởi tạo Minikube (Kubernetes) trong môi trường CI.

### Phase 3: Deployment & Validation
10. **Deploy Staging**: Deploy tất cả services lên Kubernetes Staging, inject Secret và ConfigMap.
11. **API Integration Test**: Chạy Postman/Newman collections để kiểm tra tích hợp API qua Gateway.
12. **E2E Testing**: Kiểm thử giao diện và luồng người dùng cuối.

### Phase 4: Feedback & Operations
13. **Auto-Jira Ticketing**: 
    *   Tự động tạo Jira Bug nếu chất lượng code SonarCloud không đạt.
    *   Tự động tạo Jira Bug nếu API Test thất bại.
14. **GitHub Pages Reporting**: Xuất báo cáo kết quả API Test dưới dạng HTML.
15. **Production Gate (Approve)**: Cơ chế "Manual Approval" trước khi lên môi trường Production.
16. **Monitoring**: Giám sát sức khỏe hệ thống qua Prometheus/Grafana.

---

## Trạng thái tích hợp hệ thống

| Tính năng | Trạng thái | Ghi chú |
| :--- | :---: | :--- |
| **Backend Unit Test** | ✅ | Mocking dependencies (Isolated) |
| **Static Analysis** | ✅ | SonarCloud Integration |
| **Security Scan** | ✅ | Trivy FS Scan |
| **Quality Audit** | ✅ | API Check + **Auto Jira Bug** |
| **Docker Build/Push** | ✅ | Docker Hub Registry |
| **Kubernetes Staging** | ✅ | Minikube-in-CI |
| **API Test (Newman)** | ✅ | Report to GH Pages + **Auto Jira Bug** |
| **Manual Approval** | ✅ | Production Environment Guard |
| **Monitoring** | ✅ | Actuator + Monitoring Setup |
