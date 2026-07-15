# CI/CD Enterprise Pipeline - VoltNexus EV Ecosystem

> This document details the automated CI/CD pipeline defined in `ci-cd-pipeline.yml`.

---

## Trigger Events

| Condition | Description |
| :--- | :--- |
| `push` to `main` | Triggers the complete automated pipeline |
| `workflow_dispatch` | Manual trigger via GitHub Actions UI |

---

## Stage 1: CI & Staging Deployment (`ci-staging`)

The CI, Docker Build, and Staging Deployment run in a **single job** on `ubuntu-latest`.

### 🔵 CI Phase

| Step | Name | Description |
| :--- | :--- | :--- |
| 1 | **Checkout Code** | Clones the repository with full history (`fetch-depth: 0`) |
| 2 | **Build Common Library** | Sets up Java 21 (Temurin) + Maven cache, then builds `common-lib` via `mvn clean install -pl common-lib -DskipTests` |
| 3 | **Unit Test** | Runs `mvn test -DskipITs` across all services with injected secrets |
| 4 | **Static Analysis (SonarCloud)** | Executes `mvn sonar:sonar` and **blocks pipeline** if the Quality Gate fails |
| 5 | **Check SonarCloud Issues** | Calls the SonarCloud REST API to count unresolved `BLOCKER` / `CRITICAL` issues |
| 6 | **Jira Bug (SonarCloud)** | *(If issues exist)* Automatically creates a High-priority Jira Bug via Jira REST API v2 |
| 7 | **Security Scan (Trivy)** | Scans for `CRITICAL/HIGH` vulnerabilities in the filesystem |

### 🐳 Docker Phase

| Step | Name | Description |
| :--- | :--- | :--- |
| 8 | **Staging: Bootstrap Minikube** | Initializes a local Kubernetes cluster (Minikube) in the CI runner |
| 9 | **Docker: Build** | Builds Docker images for all **10 services** tagging with `latest` and `{git-sha}` |
| 10 | **Docker: Push Registry** | *(Main branch only)* Pushes images to Docker Hub under `{DOCKER_USER}/voltnexus-{svc}` |

### ☸️ Staging Deployment Phase

| Step | Name | Description |
| :--- | :--- | :--- |
| 11 | **Inject Secrets & Apply K8s** | Applies `k8s/namespace.yaml`, `k8s/infrastructure/`, and creates K8s secrets dynamically from GitHub environment variables |
| 12 | **Deploy Backend Services** | Applies `kubectl apply -f k8s/services/`, waits for the Gateway to be ready (`timeout=600s`) |

### 🧪 Testing Phase

| Step | Name | Description |
| :--- | :--- | :--- |
| 13 | **API Test: Setup Newman** | Installs Postman CLI, `newman`, and `newman-reporter-htmlextra` |
| 14 | **API Test: Execute Newman** | Port-forwards Gateway to `localhost:8080`, executes Postman Collection from Postman Cloud, exports HTML report |
| 15 | **E2E Test** | Placeholder for automated UI testing (Playwright/Cypress) |

### 📢 Reporting & Notifications Phase

| Step | Name | Description |
| :--- | :--- | :--- |
| 16 | **Publish to GitHub Pages** | Commits and pushes `report.html` to the `gh-pages` branch |
| 17 | **Jira Bug (API Failure)** | *(If Newman fails)* Automatically creates a Highest-priority Jira Bug linking to the GitHub Pages report |

---

## Stage 2: Production Deployment (`production-deploy`)

This job strictly runs **after Stage 1 succeeds** and **only on the `main` branch**.

| Step | Name | Description |
| :--- | :--- | :--- |
| 1 | **Manual Approval Gate** | Uses GitHub `environment: production` requiring manual reviewer approval |
| 2 | **Deploy Production** | SSH into the AWS EC2 server, executes `docker compose pull && up -d` |
| 3 | **Monitoring** | Infrastructure health check placeholder via Prometheus/Grafana |

---

## Required Secrets

| Secret | Used In |
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

## System Integration Status

| Feature | Status | Notes | Technologies Used |
| :--- | :---: | :--- | :--- |
| **Checkout Code** | ✅ | Full source history retrieval | GitHub Actions, Git |
| **Build Common Library** | ✅ | Shared library compilation | Java 21, Maven |
| **Backend Unit Test** | ✅ | Full microservices unit testing | Maven, Java (`mvn test`) |
| **Frontend Test** | ⚠️ | Commented out in pipeline | npm, React |
| **Static Analysis & Quality Gate** | ✅ | Code quality scanning, blocks pipeline on failure | SonarCloud, Maven |
| **Check SonarCloud Issues** | ✅ | Count and extract Blocker/Critical errors | Bash, `curl`, `jq`, SonarCloud API |
| **Auto Jira Bug (SonarCloud)** | ✅ | Auto-create Jira bug on critical Sonar errors | Bash, `curl`, Jira REST API v2 |
| **Security Scan** | ✅ | File system vulnerability checks | Trivy (`aquasecurity/trivy-action`) |
| **Kubernetes Staging (Minikube)** | ✅ | Local K8s cluster initialization for CI | Minikube |
| **Docker Build/Push** | ✅ | Build 10 services, push to Docker Hub | Docker, Minikube docker-env, Docker Hub |
| **Deploy Staging: Secrets & K8s** | ✅ | Firebase configuration & K8s Secrets injection | Bash, Kubernetes (`kubectl`) |
| **Deploy Staging: Backend Services** | ✅ | Microservices deployment & readiness wait | Kubernetes (`kubectl apply`, `kubectl wait`) |
| **API Test: Setup & Execution** | ✅ | Postman collection execution against Staging Gateway | Node.js, `npm`, Newman CLI |
| **Publish Test Report** | ✅ | Static HTML report publishing | GitHub Pages (`git checkout gh-pages`) |
| **Auto Jira Bug (API Failure)** | ✅ | Auto-create Highest priority Jira bug on API test failure | Bash, `curl`, Jira REST API v2 |
| **E2E Test** | ⚠️ | Web application test execution (commented) | Playwright / Cypress |
| **Manual Approval (Production)** | ✅ | Manual approval gate before production | GitHub Environments |
| **Production Deployment** | ✅ | SSH execution, architectural rollout | SSH, Docker Compose, AWS EC2 |
| **Monitoring** | ⚠️ | Infrastructure health monitoring (commented) | Prometheus / Grafana |



