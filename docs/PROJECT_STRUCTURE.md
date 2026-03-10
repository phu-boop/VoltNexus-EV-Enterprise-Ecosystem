# Project Structure: VoltNexus EV Enterprise Ecosystem

```text
ev-dealer-platform/
├── README.md                   # Premium entry point & overview
├── PROJECT_STRUCTURE.md        # This document
├── docker-compose.yml          # Infrastructure orchestration (Kafka, Redis, MySQL)
├── wait-for-it.sh             # Startup synchronization script
├── package.json                # Root package for workspace management
├── .gitignore                 # Global git exclusion rules
│
├── common-lib/                # Shared Core Library (DTOs, Events, Models)
│   ├── Dockerfile             # Multi-stage build for shared lib
│   ├── pom.xml                # Maven configuration
│   └── src/main/java          # Shared utilities and shared business models
│
├── frontend/                  # React Ecosystem
│   ├── my-app/                # Admin & Dealer Portal (Port 5173)
│   └── customer-app/          # B2C Customer Portal (Port 5174)
│
├── gateway/                   # Spring Cloud Gateway (Port 8080)
│   ├── src/main/java          # Routing, Security, and JWT Filters
│   └── src/main/resources     # YAML routing configurations
│
├── services/                  # Business Microservices
│   ├── ai-service/            # Spring AI & Demand Forecasting
│   ├── customer-service/      # CRM & Customer Management
│   ├── dealer-service/        # Dealer Network Management
│   ├── inventory-service/     # Supply Chain & Stock Tracking
│   ├── payment-service/       # VNPAY Integration & Invoicing
│   ├── sales-service/         # Order Lifecycle & Contracts
│   ├── user-service/          # Identity (RBAC & Auth)
│   └── vehicle-service/       # Product Catalog & Specifications
│
├── sql/                       # Database Initialization & Seeding
│   ├── init.sql               # Schema definitions
│   └── seed_data_fixed.sql    # Production-ready mockup data
│
├── docs/                      # Documentation & Assets
│   ├── VNPAY.md               # Technical integration guide
│   └── assets/                # Visuals for documentation
│
└── config/                    # Environment Configuration Templates
    └── *.env.template         # Scalable config templates for deployment
```

## Service Communication Matrix

- **Synchronous:** REST APIs via Spring Cloud Gateway.
- **Asynchronous:** Event-driven architecture using Apache Kafka for high-throughput status updates (e.g., Inventory alerts, Payment confirmations).
- **Authentication:** Stateless JWT-based security distributed from the Gateway.

## Folder Organization Principles

1.  **Feature-First (Frontend):** UI components are organized by business features rather than just technical types.
2.  **Domain-Driven (Backend):** Each microservice owns its business domain and database schema.
3.  **Infrastructure-as-Code:** Docker and environment templates are collocated for reproducible deployments.