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

| Tính năng | Trạng thái | Ghi chú | Công nghệ sử dụng |
| :--- | :---: | :--- | :--- |
| **Checkout Code** | ✅ | Lấy toàn bộ lịch sử mã nguồn | GitHub Actions (`actions/checkout@v4`), Git |
| **Build Common Library** | ✅ | Biên dịch thư viện chung của hệ thống | Java 21, Maven (`actions/setup-java@v4`) |
| **Backend Unit Test** | ✅ | Kiểm thử đơn vị cho toàn bộ microservices | Maven, Java (`mvn test`) |
| **Frontend Test** | ⚠️ | Đang bị comment trong pipeline | npm, React/Vue (Dự kiến) |
| **Static Analysis & Quality Gate** | ✅ | Quét chất lượng code, chặn pipeline nếu có lỗi | SonarCloud, Maven (`sonar-maven-plugin`) |
| **Check SonarCloud Issues** | ✅ | Đếm và trích xuất số lượng lỗi Blocker/Critical | Bash, `curl`, `jq`, SonarCloud REST API |
| **Auto Jira Bug (SonarCloud)** | ✅ | Tự động tạo Bug trên Jira khi có lỗi nghiêm trọng từ Sonar | Bash, `curl`, Jira REST API v2 |
| **Security Scan** | ✅ | Kiểm tra lỗ hổng bảo mật tập tin hệ thống | Trivy (`aquasecurity/trivy-action`) |
| **Kubernetes Staging (Minikube)** | ✅ | Khởi tạo cụm K8s nội bộ cho môi trường CI | Minikube (`medyagh/setup-minikube`) |
| **Docker Build/Push** | ✅ | Build 10 services, đẩy lên registry Docker Hub | Docker, Minikube docker-env, Docker Hub |
| **Deploy Staging: Secrets & K8s** | ✅ | Cấu hình Firebase & inject K8s Secrets từ GitHub Secrets | Bash, Kubernetes (`kubectl create secret`, `kubectl apply`) |
| **Deploy Staging: Backend Services** | ✅ | Triển khai microservices lên K8s và chờ các pod sẵn sàng | Kubernetes (`kubectl apply`, `kubectl wait`) |
| **API Test: Setup & Execution** | ✅ | Tải collection từ Postman, chạy và port-forward tới Gateway | Node.js, `npm`, Postman API, Newman CLI |
| **Publish Test Report** | ✅ | Xuất kết quả kiểm thử tĩnh (HTML) | GitHub Pages (`git checkout gh-pages`) |
| **Auto Jira Bug (API Failure)** | ✅ | Tạo thẻ lỗi ưu tiên Highest trên Jira nếu tích hợp API thất bại | Bash, `curl`, Jira REST API v2 |
| **E2E Test** | ⚠️ | Khởi chạy kịch bản kiểm thử giao diện (hiện đang comment) | Playwright / Cypress (Dự kiến) |
| **Manual Approval (Production)** | ✅ | Cổng xét duyệt thủ công trước khi đưa lên môi trường thật | GitHub Environments |
| **Production Deployment** | ✅ | Kết nối SSH vào máy chủ, khởi động kiến trúc microservices | SSH (`appleboy/ssh-action`), Docker Compose, AWS EC2 |
| **Monitoring** | ⚠️ | Giám sát sức khỏe hạ tầng qua API (hiện đang comment) | Prometheus / Grafana (Dự kiến) |


no passs
-Notify: Jira Bug on SonarCloud Quality Gate Failure
(Dùng  và  để đảm bảo biến được điền giá trị trước khi chạy shell
  # Dùng  và  để đảm bảo biến được điền giá trị trước khi chạy shell
  SUMMARY="[SonarCloud] phu-boop/VoltNexus-EV-Enterprise-Ecosystem - 2 Critical Issues Found (#115)"
  DESCRIPTION="🚨 *SonarCloud Quality Gate Failure*\n\n*Repository:* phu-boop/VoltNexus-EV-Enterprise-Ecosystem\n*Branch:* main\n*Workflow:* CI/CD Enterprise Pipeline\n*Run ID:* [23645486686](https://github.com/phu-boop/VoltNexus-EV-Enterprise-Ecosystem/actions/runs/23645486686)\n\nFound *2* issues with severity *BLOCKER* or *CRITICAL*.\n\n*SonarCloud Project:* [View Issues](https://sonarcloud.io/project/issues?id=phu-boop_VoltNexus-EV-Enterprise-Ecosystem&resolved=false&severities=BLOCKER%2CCRITICAL)"
  
  cat <<EOF > jira-sonar-payload.json
  ***
    "fields": ***
      "project": *** "key": "$JIRA_PROJECT_KEY" ***,
      "summary": "$SUMMARY",
      "description": "$DESCRIPTION",
      "issuetype": *** "name": "Bug" ***,
      "priority": *** "name": "High" ***
    ***
  ***
  EOF
  CLEAN_URL=$(echo "$***JIRA_BASE_URL***" | sed 's:\/*$::')
  curl -s -X POST --url "$***CLEAN_URL***/rest/api/2/issue" \
    --user "$***JIRA_USER_EMAIL***:$***JIRA_API_TOKEN***" \
    --header "Content-Type: application/json" \
    --data @jira-sonar-payload.json
  shell: /usr/bin/bash -e ***0***
  env:
    JAVA_HOME: /opt/hostedtoolcache/Java_Temurin-Hotspot_jdk/21.0.10-7/x64
    JAVA_HOME_21_X64: /opt/hostedtoolcache/Java_Temurin-Hotspot_jdk/21.0.10-7/x64
    JIRA_BASE_URL: ***
    JIRA_USER_EMAIL: ***
    JIRA_API_TOKEN: ***
    JIRA_PROJECT_KEY: ***
***"errorMessages":["You do not have permission to create issues in this project."],"errors":***)
-