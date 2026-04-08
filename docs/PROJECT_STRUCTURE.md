# Project Structure: VoltNexus EV Enterprise Ecosystem

```text
.
└── VoltNexus-EV-Enterprise-Ecosystem
    ├── common-lib
    │   ├── Dockerfile
    │   ├── mvnw
    │   ├── mvnw.cmd
    │   ├── package-lock.json
    │   ├── pom.xml
    │   ├── src
    │   └── target
    ├── docker
    │   └── docker-compose.yml
    ├── docker-compose.yml
    ├── docs
    │   ├── assets
    │   ├── comandLine
    │   ├── GitFlow.jpg
    │   ├── Kubernetes Cluster (multi-node) struct.md
    │   ├── PIPELINE.md
    │   └── PROJECT_STRUCTURE.md
    ├── frontend
    │   ├── customer-app
    │   ├── my-app
    │   └── package-lock.json
    ├── gateway
    │   ├── Dockerfile
    │   ├── mvnw
    │   ├── mvnw.cmd
    │   ├── pom.xml
    │   ├── src
    │   └── target
    ├── infrastructure
    │   ├── grafana
    │   └── prometheus
    ├── k8s
    │   ├── configmap.yaml
    │   ├── infrastructure
    │   ├── namespace.yaml
    │   └── services
    ├── LICENSE
    ├── pom.xml
    ├── Postman-json
    │   ├── BUG_HUNTING_Reporting_Service.json
    │   ├── BUG_REPORT_REPORTING_SERVICE.md
    │   ├── Reporting_Service_Collection.json
    │   └── test_users.csv
    ├── README.md
    ├── scripts
    │   ├── bulk_data_generator.py
    │   └── k8s-deploy-secrets.sh
    ├── services
    │   ├── ai-service
    │   ├── customer-service
    │   ├── dealer-service
    │   ├── inventory-service
    │   ├── payment-service
    │   ├── reporting-service
    │   ├── sales-service
    │   ├── user-service
    │   └── vehicle-service
    └── sql
        ├── bulk
        ├── init.sql
        └── seed_data_fixed.sql
```

## Service Communication Matrix

- **Synchronous:** REST APIs via Spring Cloud Gateway.
- **Asynchronous:** Event-driven architecture using Apache Kafka for high-throughput status updates (e.g., Inventory alerts, Payment confirmations).
- **Authentication:** Stateless JWT-based security distributed from the Gateway.

## Folder Organization Principles

1.  **Feature-First (Frontend):** UI components are organized by business features rather than just technical types.
2.  **Domain-Driven (Backend):** Each microservice owns its business domain and database schema.
3.  **Infrastructure-as-Code:** Docker and environment templates are collocated for reproducible deployments.