# Architecture — VoltNexus EV Enterprise Ecosystem

## High-Level Architecture

VoltNexus follows a **Domain-Driven Microservices Architecture** pattern. Each service owns its domain data (DB-per-service), communicates synchronously via REST through the Gateway, and asynchronously via Apache Kafka for decoupled event propagation.

```
╔══════════════════════════════════════════════════════════════════════════╗
║                          PRESENTATION TIER                               ║
║                                                                          ║
║   ┌──────────────────┐              ┌──────────────────┐                 ║
║   │  React Admin App  │              │ React Customer App│                 ║
║   │  (my-app / :5173) │              │ (customer-app)    │                 ║
║   └────────┬──────────┘              └────────┬──────────┘                ║
╚════════════│═════════════════════════════════│═════════════════════════════╝
             │ HTTPS + JWT Bearer               │ HTTPS + JWT Bearer
             │ WS (STOMP/SockJS)                │
╔════════════▼═════════════════════════════════▼═════════════════════════════╗
║                          API GATEWAY TIER                                  ║
║                                                                            ║
║   ┌────────────────────────────────────────────────────────────────────┐   ║
║   │                Spring Cloud Gateway (:8080)                        │   ║
║   │                                                                    │   ║
║   │   JwtGlobalFilter → Redis Blacklist Check → Route                 │   ║
║   │   GuestRateLimitFilter (Bucket4j) → AI Service                   │   ║
║   │   CORS Configuration (Global)                                     │   ║
║   │   Path Rewriting per downstream service                           │   ║
║   └────────────────────────────────────────────────────────────────────┘   ║
╚════════════════════════════════════════════════════════════════════════════╝
             │ Propagates: X-User-Email, X-User-Role, X-User-Id,
             │             X-User-ProfileId, X-User-DealerId
╔════════════▼═════════════════════════════════════════════════════════════╗
║                         SERVICE TIER                                      ║
║                                                                           ║
║  ┌──────────┐ ┌──────────────┐ ┌───────────┐ ┌───────────┐ ┌─────────┐ ║
║  │  User    │ │  Customer    │ │  Dealer   │ │ Inventory │ │ Payment │ ║
║  │  :8081   │ │  :8082       │ │  :8083    │ │  :8084    │ │  :8085  │ ║
║  └────┬─────┘ └──────┬───────┘ └─────┬─────┘ └─────┬─────┘ └────┬────┘ ║
║       │              │               │              │            │       ║
║  ┌────┴─────┐ ┌──────┴───────┐ ┌────┴──────┐                           ║
║  │  Sales   │ │   Vehicle    │ │ Reporting │                            ║
║  │  :8086   │ │   :8087      │ │  :8088    │                            ║
║  └────┬─────┘ └──────────────┘ └────┬──────┘                            ║
║       │                              │                                   ║
║  ┌────┴───────────────────────────────────────┐                          ║
║  │            AI Service (:8500)               │                          ║
║  │   Gemini LLM │ Forecasting │ Production Plan│                          ║
║  └────────────────────────────────────────────┘                          ║
╚════════════════════════════════════════════════════════════════════════════╝
             │                │
╔════════════▼════════════════▼═══════════════════════════════════════════╗
║                         DATA & MESSAGING TIER                            ║
║                                                                          ║
║   ┌────────────┐  ┌─────────────────────┐  ┌─────────────────────────┐ ║
║   │ MySQL DBs  │  │ Apache Kafka + ZK    │  │     Redis Stack         │ ║
║   │ (per svc)  │  │ (Event Bus :9092)    │  │  (:6379/6380)           │ ║
║   └────────────┘  └─────────────────────┘  └─────────────────────────┘ ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## Service Interaction Diagram

### Synchronous REST (via Gateway)

| Caller | Callee | Purpose |
|---|---|---|
| AI Service | Sales Service | Fetch sales history for variant |
| AI Service | Inventory Service | Fetch current stock for variant |
| AI Service | Vehicle Service | Fetch vehicle details for planning |
| AI Service | Dealer Service | Fetch dealer data for analytics |
| Customer Service | User Service | Validate staff / get profile info |
| Customer Service | Notification Service (internal) | Send appointment notifications |
| Sales Service | Customer Service | Get customer profile details |
| Reporting Service | Various | Backfill dealer/vehicle data |

### Asynchronous Kafka Events

| Producer | Topic (inferred) | Consumer(s) | Payload |
|---|---|---|---|
| Customer Service | `customer.events` | Sales Service | Customer profile updates |
| Sales Service | `order.events` | Inventory Service, AI Service | Order created/status change |
| Sales Service | `notification.events` | Sales Service (self) | Staff notification delivery |
| Sales Service | `order.email` | Email notification sender | Order confirmation emails |
| Inventory Service | `inventory.events` | Reporting Service | Stock movements |
| User Service | `promotion.events` | User Service (consumer) | Promotion push notifications |
| Sales Service (Outbox) | Kafka (Transactional) | Multiple | Guaranteed message delivery |

### WebSocket (Real-Time)

Sales Service exposes a STOMP/SockJS endpoint (`/ws`) for real-time staff notifications. The Gateway routes WebSocket upgrades separately from regular HTTP (routes 8 & 9).

---

## Data Flow: B2C Order Lifecycle

```
Customer (Browser)
      │
      ▼ POST /sales/api/v1/orders/b2c (JWT)
API Gateway (JWT validate → forward with X-User-* headers)
      │
      ▼
Sales Service
      ├─► Write SalesOrder to MySQL sales_db
      ├─► Write Outbox record (transactional) → Outbox table
      ├─► OutboxScraper polls → publishes to Kafka
      │         │
      │         ├──► Inventory Service: reserve/allocate stock
      │         ├──► AI Service: update analytics data
      │         └──► Notification Service: trigger order confirmation email
      │
      └─► WebSocket push to dealer staff (STOMP topic)
```

## Data Flow: AI Sales Forecast

```
Client → GET /ai/forecast/{variantId} (Gateway → AI Service)
      │
AI Service
      ├─► GET sales history from Sales Service (REST)
      ├─► GET inventory snapshot from Inventory Service (REST)
      ├─► Construct contextual prompt (Java 21 Text Blocks)
      ├─► Call Google Gemini via Spring AI ChatClient
      └─► Return JSON: { prediction, confidence_score, reasoning }
```

---

## Communication Patterns

| Pattern | Technology | Usage |
|---|---|---|
| **Synchronous REST** | Spring MVC + RestClient | Service-to-service data fetching |
| **Reactive Gateway** | Spring WebFlux + Cloud Gateway | Request routing, JWT filtering |
| **Async Messaging** | Apache Kafka (with Zookeeper) | Event propagation, decoupled workflows |
| **Transactional Outbox** | Spring Scheduler + JPA | Guaranteed Kafka delivery from Sales |
| **Real-Time Push** | STOMP over WebSocket (SockJS) | Staff dashboard notifications |
| **Firebase Push** | Firebase Admin SDK (FCM) | Mobile push notifications |
| **LLM Integration** | Spring AI + Google Gemini | AI forecasting, chat, production |

---

## Gateway Routing Table

| Gateway Path | Downstream Service | Port | Notes |
|---|---|---|---|
| `/users/**, /auth/**, /oauth2/**, /login/**` | User Service | 8081 | Direct path |
| `/customers/**, /cart/**, /test-drives/**` | Customer Service | 8082 | Direct path |
| `/dealers/**` | Dealer Service | 8083 | RewritePath strips `/dealers` prefix |
| `/inventory/**` | Inventory Service | 8084 | RewritePath |
| `/payments/**` | Payment Service | 8085 | RewritePath |
| `/sales/**` | Sales Service | 8086 | RewritePath |
| `/vehicles/**` | Vehicle Service | 8087 | RewritePath |
| `/reporting/**` | Reporting Service | 8088 | RewritePath |
| `/ws/**` (HTTP) | Sales Service | 8086 | SockJS HTTP handshake (Order=1) |
| `/ws/**` (WS Upgrade) | Sales Service | 8086 | WebSocket upgrade (Order=2) |
| `/ai/**` | AI Service | 8500 | Path rewrite + `GuestRateLimit` filter |

---

## Scalability Design

### Horizontal Scaling
- All services are **stateless** (no in-memory session); state lives in Redis or MySQL
- Services are independently deployable and scalable via Kubernetes `replicas`
- Kafka allows consumers to scale independently by adding consumer instances to the same group

### Data Isolation
- **DB-per-service** pattern: each service owns its MySQL schema; no cross-DB joins
- Cross-service data needs are resolved via synchronous REST calls or event-driven denormalization (Reporting Service caches domain data)

### Caching Strategy
- Redis used by Gateway (token blacklist), Inventory Service (stock caching), Vehicle Service (catalog caching), and User Service (session management)
- Redis database numbers are isolated per service (e.g., `database=1`, `database=2`)

### Rate Limiting
- `GuestRateLimitGatewayFilterFactory` (Bucket4j + Redis) is applied at the Gateway on `/ai/**` to throttle unauthenticated chatbot access

### Failure Isolation
- Services implement circuit-breaking at the application level using try/catch + fallback responses
- Kafka provides buffering: if a consumer is down, messages queue up and replay on recovery
- Outbox pattern in Sales Service prevents message loss even on Kafka broker downtime

---

## Architecture Decisions

| Decision | Rationale |
|---|---|
| **Spring Cloud Gateway (Reactive)** | Non-blocking I/O handles high concurrent connection volumes efficiently |
| **JWT + Redis Blacklist** | Stateless auth with safe logout capability |
| **Outbox Pattern in Sales** | Ensures atomic DB write + Kafka publish without distributed transactions |
| **Spring AI over raw OpenAI SDK** | Abstraction layer allows swapping LLM providers; built-in prompt templates |
| **Separate Frontend Apps** | Customer UX and admin UX have different requirements; clean boundary |
| **Docker building from root context** | Enables multi-stage builds to include `common-lib` without publishing to Maven Central |
| **K8s for Staging, Compose for Production** | K8s validates deployment configs in CI; Compose reduces operational overhead for single-server production |
