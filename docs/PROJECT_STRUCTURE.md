# VoltNexus EV Enterprise Ecosystem

## Executive Summary
**VoltNexus** is an enterprise-grade, cloud-native microservices platform designed for electric vehicle (EV) manufacturers and dealership networks. Engineered to handle complex automotive workflows, the ecosystem provides complete domain coverage from vehicle cataloging and B2B/B2C sales to AI-augmented production forecasting and real-time dealer notifications.

**Core Technologies:** Java 21, Spring Boot 3.5, React 18, Apache Kafka, Redis Stack, Google Gemini AI, Docker, and Kubernetes.

---

## High-Level Project Structure

```text
.
└── VoltNexus-EV-Enterprise-Ecosystem
    ├── common-lib/          # Shared Java library (DTOs, Utilities, Security Configs)
    ├── docker/              # Docker Compose templates for local environments
    ├── docs/                # Comprehensive technical documentation
    ├── frontend/            # React 18 User Interfaces
    │   ├── customer-app/    # Public-facing SPA (Browse, Cart, B2C Orders)
    │   └── my-app/          # Enterprise SPA (Admin/Dealer Dashboard)
    ├── gateway/             # Spring Cloud Gateway (Entrypoint, JWT validation, Rate Limiting)
    ├── infrastructure/      # Monitoring configs (Prometheus, Grafana dashboards)
    ├── k8s/                 # Kubernetes manifests (Namespace, Services, ConfigMaps)
    ├── scripts/             # Automation scripts (Bulk data generation, K8s secrets deployment)
    ├── services/            # Backend Microservices (Java 21 / Spring Boot 3)
    │   ├── ai-service/        # LLM integration (Demand forecasting, Chatbot via Gemini)
    │   ├── customer-service/  # CRM, Test Drives, Charging Stations
    │   ├── dealer-service/    # Dealership management & targets
    │   ├── inventory-service/ # Central & Dealer stock management
    │   ├── payment-service/   # VNPay Integration (B2B/B2C) & Invoicing
    │   ├── reporting-service/ # Analytics data aggregation
    │   ├── sales-service/     # Order lifecycle, Quotations, Outbox Pattern
    │   ├── user-service/      # OAuth2/JWT Authentication, RBAC, Firebase FCM
    │   └── vehicle-service/   # Vehicle catalog, pricing, variants
    └── sql/                 # Database initialization and bulk seed scripts
```

---

## Architectural Highlights

### 1. Domain-Driven Microservices
The backend is decomposed into 10 specialized microservices, each strictly adhering to **Domain-Driven Design (DDD)**. Every service owns its specific business domain and database schema (DB-per-service pattern), preventing tight coupling and allowing isolated scaling.

### 2. Communication Matrix
- **Synchronous REST:** Facilitated via Spring Cloud Gateway with distributed JWT token propagation.
- **Asynchronous Events:** High-throughput, decoupled event streaming using **Apache Kafka** (e.g., Inventory movement, Payment confirmations). 
- **Transactional Outbox:** Implemented in the `sales-service` to guarantee at-least-once Kafka message delivery and prevent data inconsistencies during order creation.
- **Real-Time Push:** WebSockets (STOMP/SockJS) for live dashboard notifications, and Firebase Cloud Messaging (FCM) for mobile push alerts.

### 3. Artificial Intelligence Integration
Unlike basic CRUD apps, VoltNexus leverages **Spring AI and Google Gemini** to provide true operational intelligence. The `ai-service` dynamically ingests live REST data from sales and inventory to generate 30-day demand forecasts, production plans, and contextual chatbot interactions.

### 4. Enterprise-Grade DevOps & Security
- **CI/CD:** A robust GitHub Actions pipeline encompassing automated Maven builds, SonarCloud quality gates (Static Analysis), Trivy security scans, automated Jira bug generation on failure, and HTML test reports via Newman.
- **Containerization:** Multi-stage Dockerfiles optimizing Alpine JRE 21 images.
- **Deployment:** Zero-downtime capable Kubernetes (K8s) staging environments and Docker Compose production deployments with strict approval gates.
- **Security:** Stateless JWT with Redis-backed blacklisting, 5-tiered Role-Based Access Control (RBAC), and global endpoint protection (`@PreAuthorize`).