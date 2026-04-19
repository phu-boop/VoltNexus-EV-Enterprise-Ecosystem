# VoltNexus — Kubernetes Cluster Architecture

> Phân tích từ các file: `namespace.yaml`, `configmap.yaml`, `infrastructure/data-plane.yaml`, `services/backend.yaml`

---

## 📁 Cấu trúc file manifest

```
k8s/
├── namespace.yaml              ← Namespace: voltnexus
├── configmap.yaml              ← Shared config (Kafka, Redis endpoints)
├── infrastructure/
│   └── data-plane.yaml         ← Redis, Zookeeper, Kafka
└── services/
    └── backend.yaml            ← Gateway + 9 Microservices
```

---

## 🗺️ Sơ đồ tổng quan cụm Kubernetes

```
┌─────────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster (Minikube)                 │
│                                                                  │
│  ┌───────────────────────── Namespace: voltnexus ─────────────┐  │
│  │                                                             │  │
│  │   🌐 External Traffic                                       │  │
│  │          │                                                  │  │
│  │          ▼                                                  │  │
│  │  ┌───────────────┐                                          │  │
│  │  │    gateway    │  LoadBalancer  :8080                     │  │
│  │  │  (Spring GW)  │  image: my-gateway:latest               │  │
│  │  └───────┬───────┘                                          │  │
│  │          │  routes to ClusterIP services                   │  │
│  │          ▼                                                  │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │               Microservices Layer                   │   │  │
│  │  │                                                     │   │  │
│  │  │  ┌──────────────┐  :8081  ClusterIP                │   │  │
│  │  │  │ user-service │                                   │   │  │
│  │  │  └──────────────┘                                   │   │  │
│  │  │  ┌─────────────────┐  :8082  ClusterIP              │   │  │
│  │  │  │ customer-service│                                │   │  │
│  │  │  └─────────────────┘                                │   │  │
│  │  │  ┌────────────────┐  :8083  ClusterIP               │   │  │
│  │  │  │ dealer-service │                                 │   │  │
│  │  │  └────────────────┘                                 │   │  │
│  │  │  ┌──────────────────┐  :8084  ClusterIP             │   │  │
│  │  │  │inventory-service │                               │   │  │
│  │  │  └──────────────────┘                               │   │  │
│  │  │  ┌─────────────────┐  :8085  ClusterIP              │   │  │
│  │  │  │ payment-service │                                │   │  │
│  │  │  └─────────────────┘                                │   │  │
│  │  │  ┌───────────────┐  :8086  ClusterIP                │   │  │
│  │  │  │ sales-service │                                  │   │  │
│  │  │  └───────────────┘                                  │   │  │
│  │  │  ┌─────────────────┐  :8087  ClusterIP              │   │  │
│  │  │  │ vehicle-service │                                │   │  │
│  │  │  └─────────────────┘                                │   │  │
│  │  │  ┌───────────────────┐  :8088  ClusterIP            │   │  │
│  │  │  │ reporting-service │                              │   │  │
│  │  │  └───────────────────┘                              │   │  │
│  │  │  ┌────────────┐  :8089  ClusterIP                   │   │  │
│  │  │  │ ai-service │                                     │   │  │
│  │  │  └────────────┘                                     │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  │          │                      │                           │  │
│  │          ▼                      ▼                           │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │               Data / Messaging Layer                │   │  │
│  │  │                                                     │   │  │
│  │  │  ┌──────────┐   ┌───────────┐   ┌────────────────┐ │   │  │
│  │  │  │ redis-db │   │ zookeeper │   │     kafka      │ │   │  │
│  │  │  │  :6379   │   │   :2181   │◄──│ :9092 / :29092 │ │   │  │
│  │  │  │ClusterIP │   │ ClusterIP │   │   ClusterIP    │ │   │  │
│  │  │  └──────────┘   └───────────┘   └────────────────┘ │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  │                                                             │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │              ConfigMap: voltnexus-config             │   │  │
│  │  │  SPRING_PROFILES_ACTIVE=docker                      │   │  │
│  │  │  KAFKA_BOOTSTRAP_SERVERS=kafka:9092                 │   │  │
│  │  │  REDIS_HOST=redis-db  │  REDIS_PORT=6379            │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Bảng tổng hợp các Workload

| Tên | Kind | Port | Service Type | Image |
|-----|------|------|-------------|-------|
| **gateway** | Deployment | 8080 | **LoadBalancer** | my-gateway:latest |
| user-service | Deployment | 8081 | ClusterIP | my-user-service:latest |
| customer-service | Deployment | 8082 | ClusterIP | my-customer-service:latest |
| dealer-service | Deployment | 8083 | ClusterIP | my-dealer-service:latest |
| inventory-service | Deployment | 8084 | ClusterIP | my-inventory-service:latest |
| payment-service | Deployment | 8085 | ClusterIP | my-payment-service:latest |
| sales-service | Deployment | 8086 | ClusterIP | my-sales-service:latest |
| vehicle-service | Deployment | 8087 | ClusterIP | my-vehicle-service:latest |
| reporting-service | Deployment | 8088 | ClusterIP | my-reporting-service:latest |
| ai-service | Deployment | 8089 | ClusterIP | my-ai-service:latest |
| **redis-db** | Deployment | 6379 | ClusterIP | redis/redis-stack-server:latest |
| **zookeeper** | Deployment | 2181 | ClusterIP | confluentinc/cp-zookeeper:latest |
| **kafka** | Deployment | 9092, 29092 | ClusterIP | confluentinc/cp-kafka:7.4.0 |

> Tổng: **13 Deployments**, **13 Services**, **1 Namespace**, **1 ConfigMap**

---

## 🔐 Secrets (được tham chiếu, chưa có file manifest)

Mỗi service đều mount một Secret riêng qua `secretRef`:

| Secret Name | Dùng bởi |
|-------------|---------|
| `gateway-secret` | gateway |
| `user-service-secret` | user-service |
| `customer-service-secret` | customer-service |
| `dealer-service-secret` | dealer-service |
| `inventory-service-secret` | inventory-service |
| `payment-service-secret` | payment-service |
| `sales-service-secret` | sales-service |
| `vehicle-service-secret` | vehicle-service |
| `reporting-service-secret` | reporting-service |
| `ai-service-secret` | ai-service |

> ⚠️ Các Secret này **chưa có file manifest** trong thư mục `k8s/`. Cần tạo `secrets.yaml` hoặc quản lý qua Sealed Secrets / External Secrets Operator trước khi deploy.

---

## 🔄 Luồng request

```
Client (browser/app)
    │
    ▼  HTTP :8080
  gateway  ←──── LoadBalancer (entry point duy nhất từ bên ngoài)
    │
    ├──► user-service      :8081
    ├──► customer-service  :8082
    ├──► dealer-service    :8083
    ├──► inventory-service :8084
    ├──► payment-service   :8085
    ├──► sales-service     :8086
    ├──► vehicle-service   :8087
    ├──► reporting-service :8088
    └──► ai-service        :8089
              │
              ▼
    ┌─────────────────────┐
    │  kafka  ←  zookeeper│  (async messaging)
    └─────────────────────┘
              │
              ▼
         redis-db           (cache / session)
```

---

## ⚠️ Những gì còn thiếu (cần bổ sung)

| Thiếu | Ghi chú |
|-------|---------|
| `secrets.yaml` | 10 secrets đang được mount nhưng chưa có file |
| Ingress manifest | Chưa có Nginx Ingress Controller config |
| PersistentVolumeClaim | Redis & Kafka không có storage, mất data khi pod restart |
| Liveness/Readiness Probes | Chưa cấu hình health check cho bất kỳ service nào |
| Resource limits | Chưa set CPU/Memory limits/requests |
| HorizontalPodAutoscaler | Chưa có autoscaling config |





#	Vấn đề	Mức độ
1	10 Secrets chưa có file manifest — deploy sẽ fail	🔴 Critical
2	Redis/Kafka không có PVC — mất data khi restart	🟠 High
3	Chưa có Ingress config	🟡 Medium
4	Chưa có health probes / resource limits	🟡 Medium


## Kubernetes Local Test

Sơ đồ chi tiết:  
👉 https://app.eraser.io/workspace/LozaneJIRywceayznhGb
