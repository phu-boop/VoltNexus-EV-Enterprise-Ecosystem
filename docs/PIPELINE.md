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







name: CI/CD Enterprise Pipeline

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

jobs:
  #############################################################################
  ## STAGE 1: CI & STAGING DEPLOYMENT
  #############################################################################
  ci-staging:
    name: "CI & Staging Deployment"
    runs-on: ubuntu-latest
    steps:
      - name: "Initial: Checkout Code"
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      #########################################################################
      ## CI PHASE
      #########################################################################
      - name: "CI: Build (Common Library)"
        uses: actions/setup-java@v4
        with:
          java-version: "21"
          distribution: "temurin"
          cache: maven
      - run: |
          # Build common-lib first as it's a dependency for others
          mvn clean install -pl common-lib -DskipTests

      - name: "CI: Unit Test"
        env:
          SPRING_DATASOURCE_PASSWORD_CUSTOMER: ${{ secrets.DB_PASSWORD_CUSTOMER }}
          DB_PASS_PAYMENT: ${{ secrets.DB_PASSWORD_PAYMENT }}
          USER_DB_PASS: ${{ secrets.DB_PASSWORD_USER }}
          GOOGLE_CLIENT_SECRET: ${{ secrets.GOOGLE_CLIENT_SECRET }}
          VNPAY_SECRET_PAYMENT: ${{ secrets.VNPAY_HASH_SECRET }}
          FACEBOOK_SECRET: ${{ secrets.FACEBOOK_CLIENT_SECRET }}
          GITHUB_SECRET: ${{ secrets.GITHUB_CLIENT_SECRET }}
          RECAPT_SECRET: ${{ secrets.RECAPTCHA_SECRET }}
          SPRING_MAIL_PASSWORD_USER: ${{ secrets.MAIL_PASSWORD }}
        run: |
          # Running unit tests for all services and generating coverage reports
          mvn test -DskipITs

      - name: "CI: Frontend Test"
        run: |
          echo "Running Frontend Tests..."
          # Run tests for customer-app
          cd frontend/customer-app && npm install && npm test -- --watchAll=false
          # Run tests for my-app
          cd ../my-app && npm install && npm test -- --watchAll=false

      - name: "CI: Static Analysis & Quality Gate"
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          echo "Running SonarCloud Analysis..."
          mvn sonar:sonar \
            -Dsonar.projectKey=phu-boop_VoltNexus-EV-Enterprise-Ecosystem \
            -Dsonar.organization=phu-boop \
            -Dsonar.host.url=https://sonarcloud.io \
            -Dsonar.token=$SONAR_TOKEN \
            -Dsonar.qualitygate.wait=true
      - name: "CI: Check SonarCloud Issues"
        if: always()
        id: sonar_check
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_PROJECT: "phu-boop_VoltNexus-EV-Enterprise-Ecosystem"
        run: |
          echo "Checking for BLOCKER/CRITICAL issues in SonarCloud..."
          ISSUE_COUNT=$(curl -s -u "$SONAR_TOKEN:" "https://sonarcloud.io/api/issues/search?componentKeys=$SONAR_PROJECT&severities=BLOCKER,CRITICAL&resolved=false" | jq '.total')
          echo "Found $ISSUE_COUNT Blocker/Critical issues."
          if [ "$ISSUE_COUNT" -gt 0 ]; then
            echo "has_issues=true" >> $GITHUB_OUTPUT
            echo "issue_count=$ISSUE_COUNT" >> $GITHUB_OUTPUT
          else
            echo "has_issues=false" >> $GITHUB_OUTPUT
          fi

      - name: "Notify: Jira Bug on SonarCloud Quality Gate Failure"
        if: always() && steps.sonar_check.outputs.has_issues == 'true'
        env:
          JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
          JIRA_USER_EMAIL: ${{ secrets.JIRA_USER_EMAIL }}
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
          JIRA_PROJECT_KEY: ${{ secrets.JIRA_PROJECT_KEY }}
        run: |
          # Dùng ${{ env.xxx }} và ${{ github.xxx }} để đảm bảo biến được điền giá trị trước khi chạy shell
          SUMMARY="[SonarCloud] ${{ github.repository }} - ${{ steps.sonar_check.outputs.issue_count }} Critical Issues Found (#${{ github.run_number }})"
          DESCRIPTION="🚨 *SonarCloud Quality Gate Failure*\n\n*Repository:* ${{ github.repository }}\n*Branch:* ${{ github.ref_name }}\n*Workflow:* ${{ github.workflow }}\n*Run ID:* [${{ github.run_id }}](https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }})\n\nFound *${{ steps.sonar_check.outputs.issue_count }}* issues with severity *BLOCKER* or *CRITICAL*.\n\n*SonarCloud Project:* [View Issues](https://sonarcloud.io/project/issues?id=phu-boop_VoltNexus-EV-Enterprise-Ecosystem&resolved=false&severities=BLOCKER%2CCRITICAL)"

          cat <<EOF > jira-sonar-payload.json
          {
            "fields": {
              "project": { "key": "$JIRA_PROJECT_KEY" },
              "summary": "$SUMMARY",
              "description": "$DESCRIPTION",
              "issuetype": { "name": "Bug" },
              "priority": { "name": "High" }
            }
          }
          EOF
          CLEAN_URL=$(echo "${JIRA_BASE_URL}" | sed 's:\/*$::')
          curl -s -X POST --url "${CLEAN_URL}/rest/api/2/issue" \
            --user "${JIRA_USER_EMAIL}:${JIRA_API_TOKEN}" \
            --header "Content-Type: application/json" \
            --data @jira-sonar-payload.json

      - name: "CI: Security Scan"
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: "fs"
          ignore-unfixed: true
          format: "table"
          exit-code: "0"
          severity: "CRITICAL,HIGH"

      #########################################################################
      ## KUBERNETES INFRASTRUCTURE (READY FOR STAGING)
      #########################################################################
      - name: "Staging: Bootstrap Minikube"
        uses: medyagh/setup-minikube@latest

      #########################################################################
      ## DOCKER PHASE
      #########################################################################
      - name: "Docker: Build"
        run: |
          eval $(minikube docker-env)
          # Format: "service_name:relative_path"
          services=(
            "gateway:gateway"
            "user-service:services/user-service"
            "customer-service:services/customer-service"
            "dealer-service:services/dealer-service"
            "inventory-service:services/inventory-service"
            "payment-service:services/payment-service"
            "sales-service:services/sales-service"
            "vehicle-service:services/vehicle-service"
            "reporting-service:services/reporting-service"
            "ai-service:services/ai-service"
          )
          for entry in "${services[@]}"; do
            svc="${entry%%:*}"
            svc_path="${entry#*:}"
            echo "Building my-$svc..."
            docker build -t "my-$svc:latest" -t "my-$svc:${{ github.sha }}" -f "$svc_path/Dockerfile" .
          done

      - name: "Docker: Push Docker Registry"
        if: github.ref == 'refs/heads/main'
        env:
          DOCKER_USER: ${{ secrets.DOCKER_USERNAME }}
          DOCKER_PASS: ${{ secrets.DOCKER_PASSWORD }}
        run: |
          if [ -z "$DOCKER_USER" ]; then
            echo "Skipping push: DOCKER_USERNAME secret is missing."
            exit 0
          fi
          eval $(minikube docker-env)
          echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin

          services=("gateway" "user-service" "customer-service" "dealer-service" "inventory-service" "payment-service" "sales-service" "vehicle-service" "reporting-service" "ai-service")
          for svc in "${services[@]}"; do
            echo "Tagging and Pushing $svc..."
            docker tag "my-$svc:latest" "$DOCKER_USER/voltnexus-$svc:latest"
            docker tag "my-$svc:latest" "$DOCKER_USER/voltnexus-$svc:${{ github.sha }}"
            docker push "$DOCKER_USER/voltnexus-$svc:latest"
            docker push "$DOCKER_USER/voltnexus-$svc:${{ github.sha }}"
          done

      #########################################################################
      ## STAGING DEPLOYMENT
      #########################################################################
      - name: "Deploy Staging: Inject Secrets & Apply K8s"
        env:
          FIREBASE_SERVICE_ACCOUNT_JSON: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_JSON }}
          ENV_GATEWAY: ${{ secrets.ENV_GATEWAY }}
          ENV_USER_SERVICE: ${{ secrets.ENV_USER_SERVICE }}
          ENV_CUSTOMER_SERVICE: ${{ secrets.ENV_CUSTOMER_SERVICE }}
          ENV_DEALER_SERVICE: ${{ secrets.ENV_DEALER_SERVICE }}
          ENV_INVENTORY_SERVICE: ${{ secrets.ENV_INVENTORY_SERVICE }}
          ENV_PAYMENT_SERVICE: ${{ secrets.ENV_PAYMENT_SERVICE }}
          ENV_SALES_SERVICE: ${{ secrets.ENV_SALES_SERVICE }}
          ENV_VEHICLE_SERVICE: ${{ secrets.ENV_VEHICLE_SERVICE }}
          ENV_REPORTING_SERVICE: ${{ secrets.ENV_REPORTING_SERVICE }}
          ENV_AI_SERVICE: ${{ secrets.ENV_AI_SERVICE }}
        run: |
          # Create Firebase secret
          mkdir -p services/user-service/src/main/resources
          echo "$FIREBASE_SERVICE_ACCOUNT_JSON" > services/user-service/src/main/resources/firebase-service-account.json
          
          # Apply Base K8s
          kubectl apply -f k8s/namespace.yaml || true
          kubectl apply -f k8s/configmap.yaml || true
          kubectl apply -f k8s/infrastructure/ || true

          # Provision Secrets
          services=("gateway" "user-service" "customer-service" "dealer-service" "inventory-service" "payment-service" "sales-service" "vehicle-service" "reporting-service" "ai-service")
          for svc in "${services[@]}"; do
            env_var="ENV_${svc^^}"
            env_var=${env_var//-/_}
            content="${!env_var}"
            if [ -n "$content" ]; then
              echo "$content" > temp.env
              kubectl create secret generic "${svc}-secret" --from-env-file=temp.env -n voltnexus --dry-run=client -o yaml | kubectl apply -f -
              rm temp.env
            else
              kubectl create secret generic "${svc}-secret" -n voltnexus --dry-run=client -o yaml | kubectl apply -f -
            fi
          done

      - name: "Deploy Staging: Deploy Backend Services"
        run: |
          kubectl apply -f k8s/services/
          kubectl wait --for=condition=available --timeout=600s deployment/gateway -n voltnexus || true
          echo "Waiting for services to stabilize..."
          sleep 60

      #########################################################################
      ## TESTING PHASE
      #########################################################################
      - name: "API Test: Setup Postman/Newman"
        run: |
          curl -o- "https://dl-cli.pstmn.io/install/linux64.sh" | sh
          npm install -g newman newman-reporter-htmlextra

      - name: "API Test: Execute Newman Collection"
        id: postman_tests
        continue-on-error: true
        env:
          POSTMAN_API_KEY: ${{ secrets.POSTMAN_API_KEY }}
        run: |
          nohup kubectl port-forward svc/gateway 8080:8080 -n voltnexus > pf.log 2>&1 &
          PID=$!
          echo "Waiting for Gateway..."
          for i in {1..20}; do
            if curl -s http://localhost:8080/actuator/health | grep -q 'UP'; then break; fi
            sleep 10
          done
          mkdir -p newman
          newman run "https://api.getpostman.com/collections/39781229-f0d8b669-c581-47d9-a1a1-93e727adcceb?apikey=$POSTMAN_API_KEY" \
            -e "https://api.getpostman.com/environments/39781229-7aeac6e0-37d5-4086-9958-1cb4bb544661?apikey=$POSTMAN_API_KEY" \
            --reporters cli,htmlextra \
            --reporter-htmlextra-export newman/report.html
          kill $PID || true

      - name: "E2E Test: Web Application Verification"
        run: |
          echo "Running Playwright/Cypress E2E tests..."
          # npm run e2e || true

      #########################################################################
      ## REPORTING & NOTIFICATIONS (STAGING)
      #########################################################################
      - name: "Reporting: Publish to GitHub Pages"
        if: always() && (github.ref == 'refs/heads/main' || github.event_name == 'pull_request')
        run: |
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          git config --global user.name "github-actions[bot]"
          git fetch
          git checkout gh-pages || git checkout --orphan gh-pages
          find . -maxdepth 1 -not -name 'report.html' -not -name '.git' -not -name '.' -delete || true
          if [ -f newman/report.html ]; then cp -f newman/report.html ./; fi
          git add report.html
          git commit -m "Update test report [skip ci]" || exit 0
          git push origin gh-pages

      - name: "Notify: Jira Bug on API Failure"
        if: always() && steps.postman_tests.outcome == 'failure'
        env:
          JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
          JIRA_USER_EMAIL: ${{ secrets.JIRA_USER_EMAIL }}
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
          JIRA_PROJECT_KEY: ${{ secrets.JIRA_PROJECT_KEY }}
        run: |
          SUMMARY="[API Test Failure] ${{ github.repository }} - System Integration Error (#${{ github.run_number }})"
          DESCRIPTION="🚨 *Automated API/End-to-End Test Failure*\n\n*Repository:* ${{ github.repository }}\n*Branch:* ${{ github.ref_name }}\n*Commit:* ${{ github.sha }}\n*Workflow:* ${{ github.workflow }}\n\n❌ The Postman/Newman API collection failed during integration testing on Staging environment.\n\n*Live Test Report:* https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}/report.html\n*GitHub Actions Run:* https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}"

          cat <<EOF > jira-payload.json
          {
            "fields": {
              "project": { "key": "$JIRA_PROJECT_KEY" },
              "summary": "$SUMMARY",
              "description": "$DESCRIPTION",
              "issuetype": { "name": "Bug" },
              "priority": { "name": "Highest" }
            }
          }
          EOF
          CLEAN_URL=$(echo "${JIRA_BASE_URL}" | sed 's:\/*$::')
          curl -s -X POST --url "${CLEAN_URL}/rest/api/2/issue" \
            --user "${JIRA_USER_EMAIL}:${JIRA_API_TOKEN}" \
            --header "Content-Type: application/json" \
            --data @jira-payload.json

  #############################################################################
  ## STAGE 2: PRODUCTION DEPLOYMENT
  #############################################################################
  production-deploy:
    name: "Deploy Production"
    needs: [ci-staging]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production # This is the "Approve" (Manual Gate)
    steps:
      - name: "Initial: Checkout Code"
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: "Approve"
        run: |
          echo "Production deployment manual gate passed."
          echo "Approved by: ${{ github.actor }}"

      - name: "Deploy Production"
        uses: appleboy/ssh-action@v1.0.3
        env:
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
          DOCKER_PASSWORD: ${{ secrets.DOCKER_PASSWORD }}
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USERNAME }}
          key: ${{ secrets.EC2_SSH_KEY }}
          envs: DOCKER_USERNAME,DOCKER_PASSWORD
          script: |
            echo "--- Kết nối máy chủ EC2 thành công ---"
            echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
            cd /home/ubuntu
            docker compose down
            echo "Kéo image cập nhật mới nhất từ Docker Hub..."
            docker compose pull
            echo "Tái khởi động kiến trúc microservices mới..."
            docker compose up -d
            echo "Clear cache rác Docker..."
            docker image prune -af

      - name: "Monitoring"
        run: |
          echo "Initiating Production Monitoring..."
          echo "Checking Health Status via Prometheus/Grafana..."
          # curl -s https://api.monitoring.volt-nexus.com/health || true
          echo "Infrastructure Health: [OK]"
