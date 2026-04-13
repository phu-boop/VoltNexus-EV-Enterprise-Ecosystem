# DevOps — VoltNexus EV Enterprise Ecosystem

## Overview

VoltNexus uses a **single GitHub Actions workflow** (`ci-cd-pipeline.yml`) with two sequenced jobs:
1. `ci-staging` — Full CI, Docker build, Kubernetes staging deploy, Newman API tests
2. `production-deploy` — Gated production rollout to AWS EC2

The pipeline is triggered on every push to the `main` branch and supports manual `workflow_dispatch` triggers.

---

## CI/CD Pipeline Diagram

```
git push → main
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  JOB 1: ci-staging (ubuntu-latest)                  │
│                                                     │
│  ┌─ PHASE 1: CI ───────────────────────────────┐   │
│  │ 1. Checkout (full history fetch-depth=0)     │   │
│  │ 2. Setup Java 21 (Temurin + Maven cache)    │   │
│  │ 3. mvn install -pl common-lib -DskipTests   │   │
│  │ 4. mvn test -DskipITs (all modules)         │   │
│  │ 5. npm test (customer-app + my-app)         │   │
│  │ 6. mvn sonar:sonar → SonarCloud             │   │
│  │    └─ if BLOCKER/CRITICAL → Jira Bug API    │   │
│  │ 7. Trivy FS Scan (CRITICAL, HIGH severity)  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─ PHASE 2: INFRASTRUCTURE ──────────────────┐    │
│  │ 8. Bootstrap Minikube (K8s cluster)         │    │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─ PHASE 3: DOCKER ───────────────────────────┐   │
│  │ 9. eval $(minikube docker-env)              │   │
│  │ 10. docker build (10 services, 2 tags each) │   │
│  │ 11. docker push → Docker Hub                │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─ PHASE 4: STAGING DEPLOY ───────────────────┐   │
│  │ 12. kubectl apply namespace + configmap     │   │
│  │ 13. kubectl apply infrastructure/           │   │
│  │ 14. kubectl create secret (per service)     │   │
│  │ 15. kubectl apply services/backend.yaml     │   │
│  │ 16. kubectl wait (gateway available/600s)   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─ PHASE 5: TESTING ──────────────────────────┐   │
│  │ 17. Install Postman CLI + Newman             │   │
│  │ 18. Port-forward gateway :8080              │   │
│  │ 19. Newman run (Postman Cloud collection)   │   │
│  │     └─ HTML report → GitHub Pages          │   │
│  │     └─ if failure → Jira Bug API            │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
    │ (needs: ci-staging, if: main branch)
    ▼
┌─────────────────────────────────────────────────────┐
│  JOB 2: production-deploy (ubuntu-latest)           │
│                                                     │
│  ┌─ GATE ──────────────────────────────────────┐   │
│  │ environment: production (manual approval)   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  20. SSH into AWS EC2 (appleboy/ssh-action)         │
│  21. docker login → Docker Hub                      │
│  22. docker compose down                            │
│  23. docker compose pull                            │
│  24. docker compose up -d                           │
│  25. docker image prune -af                         │
│  26. Prometheus/Grafana health check                │
└─────────────────────────────────────────────────────┘
```

---

## GitHub Actions Workflow Breakdown

### Secrets Required

| Secret | Used By | Description |
|---|---|---|
| `DB_PASSWORD_CUSTOMER` | CI Unit Tests | Customer DB password |
| `DB_PASSWORD_PAYMENT` | CI Unit Tests | Payment DB password |
| `DB_PASSWORD_USER` | CI Unit Tests | User DB password |
| `GOOGLE_CLIENT_SECRET` | CI Unit Tests | OAuth2 Google |
| `VNPAY_HASH_SECRET` | CI Unit Tests | VNPay payment gateway |
| `FACEBOOK_CLIENT_SECRET` | CI Unit Tests | OAuth2 Facebook |
| `GITHUB_CLIENT_SECRET` | CI Unit Tests | OAuth2 GitHub |
| `RECAPTCHA_SECRET` | CI Unit Tests | reCAPTCHA |
| `MAIL_PASSWORD` | CI Unit Tests | SMTP email |
| `SONAR_TOKEN` | Static Analysis | SonarCloud authentication |
| `DOCKER_USERNAME` | Docker Build/Push | Docker Hub login |
| `DOCKER_PASSWORD` | Docker Build/Push | Docker Hub login |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | K8s Deploy | Firebase Admin SDK |
| `ENV_GATEWAY` | K8s Secrets | Gateway env vars |
| `ENV_USER_SERVICE` | K8s Secrets | User service env vars |
| `ENV_CUSTOMER_SERVICE` | K8s Secrets | Customer service env vars |
| `ENV_DEALER_SERVICE` | K8s Secrets | Dealer service env vars |
| `ENV_INVENTORY_SERVICE` | K8s Secrets | Inventory service env vars |
| `ENV_PAYMENT_SERVICE` | K8s Secrets | Payment service env vars |
| `ENV_SALES_SERVICE` | K8s Secrets | Sales service env vars |
| `ENV_VEHICLE_SERVICE` | K8s Secrets | Vehicle service env vars |
| `ENV_REPORTING_SERVICE` | K8s Secrets | Reporting service env vars |
| `ENV_AI_SERVICE` | K8s Secrets | AI service env vars |
| `POSTMAN_API_KEY` | Newman Tests | Postman Cloud API |
| `JIRA_BASE_URL` | Jira Automation | Jira project URL |
| `JIRA_USER_EMAIL` | Jira Automation | Jira auth email |
| `JIRA_API_TOKEN` | Jira Automation | Jira API key |
| `JIRA_PROJECT_KEY` | Jira Automation | Jira project identifier |
| `EC2_HOST` | Production Deploy | EC2 instance IP |
| `EC2_USERNAME` | Production Deploy | EC2 SSH user |
| `EC2_SSH_KEY` | Production Deploy | EC2 private key |

---

## Docker Build Strategy

### Multi-Stage Build Pattern

Every service Dockerfile (consistent across all 9 Java services + gateway) uses a **3-stage multi-stage build**:

```dockerfile
# Stage 1: Build common-lib
FROM maven:3.9.9-eclipse-temurin-21 AS common-lib
WORKDIR /build/common-lib
COPY common-lib/pom.xml ./pom.xml
COPY common-lib/src ./src
RUN mvn clean install -DskipTests

# Stage 2: Build service JAR
FROM maven:3.9.9-eclipse-temurin-21 AS builder
# ... copies service source + common-lib from Stage 1
RUN mvn clean package -DskipTests

# Stage 3: Runtime image (minimal)
FROM eclipse-temurin:21-jre-alpine
COPY --from=builder /build/app.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Key design decisions:**
- Build context is the **repository root** (`docker build -f services/<svc>/Dockerfile .`) — enables `COPY common-lib/` from root
- `DskipTests` in Docker build (tests run separately in CI)
- Alpine-based JRE runtime minimizes image size
- Each service image has 2 tags: `:latest` and `:<git-sha>` for traceability

### Image Naming Convention

```
Docker Hub: <DOCKER_USERNAME>/voltnexus-<service-name>:latest
            <DOCKER_USERNAME>/voltnexus-<service-name>:<git-sha>

Example:    phudev/voltnexus-user-service:latest
            phudev/voltnexus-gateway:abc1234
```

---

## Kubernetes Deployment

### Cluster Layout

```
Namespace: voltnexus
│
├── ConfigMap: voltnexus-config          # Non-secret config
├── Secrets: <service-name>-secret      # Per-service env vars
│
├── Infrastructure (data-plane.yaml)
│   ├── Deployment/redis-db             # Redis Stack
│   ├── Service/redis-db                # ClusterIP :6379
│   ├── Deployment/zookeeper            # Confluent Zookeeper
│   ├── Service/zookeeper               # ClusterIP :2181
│   ├── Deployment/kafka                # Confluent Kafka 7.4.0
│   └── Service/kafka                   # ClusterIP :9092/:29092
│
└── Backend (backend.yaml)
    ├── Deployment/gateway              # LoadBalancer :8080
    ├── Deployment/user-service         # ClusterIP :8081
    ├── Deployment/customer-service     # ClusterIP :8082
    ├── Deployment/dealer-service       # ClusterIP :8083
    ├── Deployment/inventory-service    # ClusterIP :8084
    ├── Deployment/payment-service      # ClusterIP :8085
    ├── Deployment/sales-service        # ClusterIP :8086
    ├── Deployment/vehicle-service      # ClusterIP :8087
    ├── Deployment/reporting-service    # ClusterIP :8088
    └── Deployment/ai-service           # ClusterIP :8089
```

### Service Exposure
- Only the **Gateway** is exposed as `LoadBalancer` (external entry point)
- All other services are `ClusterIP` (internal-only)
- The Gateway routes all external traffic internally

### Secret Injection Process

```bash
# For each service during CI deploy:
echo "$ENV_USER_SERVICE" > temp.env
kubectl create secret generic user-service-secret \
  --from-env-file=temp.env \
  -n voltnexus \
  --dry-run=client -o yaml | kubectl apply -f -
```

Services consume secrets via `envFrom.secretRef` in their Deployment spec.

### Staging Bootstrap Commands

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/infrastructure/    # Redis, Kafka, Zookeeper
# Inject secrets...
kubectl apply -f k8s/services/          # All service deployments
kubectl wait --for=condition=available --timeout=600s deployment/gateway -n voltnexus
```

---

## Environment & Configuration Management

### Local Development
- Each service reads from `./config/<service>.env` via Docker Compose `env_file`
- Alternatively, services load `.env` files via `dotenv-java` (optional classpath import)

### CI/CD
- Secrets stored in **GitHub Actions Secrets** (per-repo, encrypted)
- Injected as environment variables in the workflow `env:` block
- Kubernetes secrets created dynamically from secret content at deploy time

### Production
- Secrets live in **GitHub Environment: production** (with protection rules)
- EC2 instance runs `docker compose` with env files written to `/home/ubuntu/`

### Firebase Service Account
```bash
# Written dynamically before K8s deploy:
mkdir -p services/user-service/src/main/resources
echo "$FIREBASE_SERVICE_ACCOUNT_JSON" > services/user-service/src/main/resources/firebase-service-account.json
```

---

## Quality Gates

### SonarCloud
- **Project:** `phu-boop_VoltNexus-EV-Enterprise-Ecosystem`
- **Coverage:** JaCoCo XML reports (`target/site/jacoco/jacoco.xml`) per module
- **Quality Gate:** Any `BLOCKER` or `CRITICAL` issue triggers automatic Jira bug creation
- **Exit behavior:** `sonar.qualitygate.wait=true` — pipeline waits for quality gate result

### Trivy Security Scan
- Scans the entire **filesystem** (not just Docker images)
- Severity threshold: `CRITICAL,HIGH`
- `ignore-unfixed: true` — only flags issues with available fixes
- `exit-code: 0` — scan is informational (does not block pipeline)
- *Note: Tighten to `exit-code: 1` for stricter security posture*

---

## Monitoring (Production)

| Tool | Port | Purpose |
|---|---|---|
| Prometheus | 9090 | Metrics scraping (Spring Actuator endpoints) |
| Grafana | 3000 | Dashboard visualization |

Spring Actuator is enabled on all services:
```properties
management.endpoints.web.exposure.include=health
management.endpoint.health.show-details=always
```

Prometheus scrape config: `infrastructure/prometheus/prometheus.yml`
Grafana dashboards: `infrastructure/grafana/dashboards/`

---

## Jira Automation

Two automated bug-creation triggers:

1. **SonarCloud Quality Gate Failure**
   - Creates a `Bug` with priority `High`
   - Summary: `[SonarCloud] <repo> - <N> Critical Issues Found (#<run>)`
   - Links to SonarCloud issues

2. **Newman API Test Failure**
   - Creates a `Bug` with priority `Highest`
   - Summary: `[API Test Failure] <repo> - System Integration Error (#<run>)`
   - Links to GitHub Pages HTML report

Both use Jira REST API v2: `POST /rest/api/2/issue`
