# CI/CD Enterprise Pipeline - VoltNexus EV Ecosystem

> Tài liệu này mô tả chính xác quy trình CI/CD tự động được định nghĩa trong [ci-cd-pipeline.yml](../.github/workflows/ci-cd-pipeline.yml).

---

## Trigger

| Điều kiện | Mô tả |
| :--- | :--- |
| `push` to `main` | Kích hoạt toàn bộ pipeline tự động |
| `workflow_dispatch` | Kích hoạt thủ công từ GitHub Actions UI |

---

## Stage 1: CI & Staging Deployment (`ci-staging`)

Toàn bộ CI, Docker Build và Staging Deployment chạy trong **một job duy nhất** trên `ubuntu-latest`.

### 🔵 CI Phase

| Bước | Tên | Mô tả |
| :--- | :--- | :--- |
| 1 | **Checkout Code** | Clone repository với full history (`fetch-depth: 0`) |
| 2 | **Build Common Library** | Setup Java 21 (Temurin) + Maven cache, sau đó build `common-lib` bằng `mvn clean install -pl common-lib -DskipTests` |
| 3 | **Unit Test** | Chạy `mvn test -DskipITs` cho toàn bộ services với các secrets được inject qua biến môi trường |
| 4 | **Static Analysis (SonarCloud)** | Chạy `mvn sonar:sonar` và **block pipeline** (`sonar.qualitygate.wait=true`) nếu Quality Gate thất bại |
| 5 | **Check SonarCloud Issues** | Gọi SonarCloud REST API để đếm số lỗi `BLOCKER` / `CRITICAL` chưa được giải quyết |
| 6 | **Jira Bug (SonarCloud)** | *(Nếu có issues)* Tự động tạo Jira Bug với mức độ `High` qua Jira REST API v2 |
| 7 | **Security Scan (Trivy)** | Quét lỗ hổng bảo mật `CRITICAL/HIGH` trong toàn bộ filesystem (`exit-code: 0` – không block) |

> **Lưu ý:** Frontend Test hiện đang bị comment (`# CI: Frontend Test`).

### 🐳 Docker Phase

| Bước | Tên | Mô tả |
| :--- | :--- | :--- |
| 8 | **Staging: Bootstrap Minikube** | Khởi động cụm Kubernetes cục bộ (Minikube) trong môi trường CI |
| 9 | **Docker: Build** | Build Docker image cho **10 services** (`gateway`, `user-service`, `customer-service`, `dealer-service`, `inventory-service`, `payment-service`, `sales-service`, `vehicle-service`, `reporting-service`, `ai-service`) với tag `latest` và `{git-sha}` |
| 10 | **Docker: Push Registry** | *(Chỉ trên nhánh `main`)* Push các image lên Docker Hub với tên `{DOCKER_USER}/voltnexus-{svc}` |

### ☸️ Staging Deployment Phase

| Bước | Tên | Mô tả |
| :--- | :--- | :--- |
| 11 | **Inject Secrets & Apply K8s** | Tạo Firebase secret file, apply `k8s/namespace.yaml`, `k8s/configmap.yaml`, `k8s/infrastructure/`, sau đó tạo K8s secrets từ biến môi trường cho từng service |
| 12 | **Deploy Backend Services** | `kubectl apply -f k8s/services/`, chờ Gateway sẵn sàng (`timeout=600s`) và ổn định (`sleep 60`) |

### 🧪 Testing Phase

| Bước | Tên | Mô tả |
| :--- | :--- | :--- |
| 13 | **API Test: Setup Newman** | Cài đặt Postman CLI và `newman` + `newman-reporter-htmlextra` |
| 14 | **API Test: Execute Newman** | Port-forward Gateway sang `localhost:8080`, chạy Postman Collection + Environment từ Postman Cloud API, xuất báo cáo HTML (`continue-on-error: true`) |
| 15 | **E2E Test** | Placeholder cho Playwright/Cypress (hiện chưa triển khai) |

### 📢 Reporting & Notifications Phase

| Bước | Tên | Mô tả |
| :--- | :--- | :--- |
| 16 | **Publish to GitHub Pages** | Commit và push file `report.html` (kết quả Newman) lên nhánh `gh-pages` |
| 17 | **Jira Bug (API Failure)** | *(Nếu Newman thất bại)* Tự động tạo Jira Bug với mức độ `Highest` + link đến báo cáo trên GitHub Pages |

---

## Stage 2: Production Deployment (`production-deploy`)

Job này chỉ chạy **sau khi Stage 1 thành công** và **chỉ trên nhánh `main`**.

| Bước | Tên | Mô tả |
| :--- | :--- | :--- |
| 1 | **Manual Approval Gate** | Sử dụng `environment: production` của GitHub → Yêu cầu reviewer phê duyệt thủ công trước khi tiếp tục |
| 2 | **Deploy Production** | Kết nối SSH vào máy chủ EC2, thực thi `docker compose pull && up -d` để chạy image mới nhất |
| 3 | **Monitoring** | Placeholder kiểm tra sức khỏe qua Prometheus/Grafana |

---

## Required Secrets

| Secret | Sử dụng ở |
| :--- | :--- |
| `DB_PASSWORD_CUSTOMER`, `DB_PASSWORD_PAYMENT`, `DB_PASSWORD_USER` | Unit Test env |
| `GOOGLE_CLIENT_SECRET`, `FACEBOOK_CLIENT_SECRET`, `GITHUB_CLIENT_SECRET` | Unit Test env |
| `VNPAY_HASH_SECRET`, `RECAPTCHA_SECRET`, `MAIL_PASSWORD` | Unit Test env |
| `SONAR_TOKEN` | SonarCloud Analysis & Issue Check |
| `JIRA_BASE_URL`, `JIRA_USER_EMAIL`, `JIRA_API_TOKEN`, `JIRA_PROJECT_KEY` | Auto Jira Bug Creation |
| `DOCKER_USERNAME`, `DOCKER_PASSWORD` | Docker Hub Push |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Staging Firebase config |
| `ENV_GATEWAY`, `ENV_USER_SERVICE`, … `ENV_AI_SERVICE` | Kubernetes Secrets injection |
| `POSTMAN_API_KEY` | Newman API Test |

---

## Trạng thái tích hợp hệ thống

| Tính năng | Trạng thái | Ghi chú |
| :--- | :---: | :--- |
| **Build Common Library** | ✅ | `mvn install -pl common-lib` |
| **Backend Unit Test** | ✅ | `mvn test -DskipITs`, mock dependencies |
| **Frontend Test** | ⚠️ | Đang bị comment trong pipeline |
| **Static Analysis (SonarCloud)** | ✅ | Quality Gate blocking |
| **Auto Jira Bug (SonarCloud)** | ✅ | Tạo Bug khi có BLOCKER/CRITICAL |
| **Security Scan (Trivy)** | ✅ | Non-blocking FS scan |
| **Docker Build/Push** | ✅ | 10 services, Docker Hub |
| **Kubernetes Staging (Minikube)** | ✅ | Minikube-in-CI |
| **API Test (Newman)** | ✅ | Report → GitHub Pages |
| **Auto Jira Bug (API Failure)** | ✅ | Tạo Bug với độ ưu tiên Highest |
| **E2E Test** | ⚠️ | Placeholder, chưa triển khai |
| **Manual Approval (Production)** | ✅ | GitHub Environment Gate |
| **Production Deployment** | ✅ | Đã cấu hình kết nối SSH tới EC2 chạy Docker Compose |
| **Monitoring** | ⚠️ | Placeholder Prometheus/Grafana |
