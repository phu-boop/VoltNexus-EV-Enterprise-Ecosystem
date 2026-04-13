# Security — VoltNexus EV Enterprise Ecosystem

## Security Architecture Overview

VoltNexus implements a **layered security model** across the Gateway and individual services:

```
Internet → API Gateway (JWT Validation + Blacklist) → Downstream Service (Role Enforcement)
```

Security responsibilities are split:
- **Gateway**: Token validation, blacklist checking, rate limiting, CORS
- **Services**: Role-based authorization via `@PreAuthorize`, business rule enforcement

---

## Authentication

### JWT-Based Authentication

**Library:** `io.jsonwebtoken:jjwt:0.12.6`

**Flow:**
```
1. POST /auth/login (email + password)
         │
         ▼
   User Service validates credentials (BCrypt)
         │
         ▼
   Issues: accessToken (short TTL) + refreshToken (long TTL)
         │
         ▼
   Client stores tokens (browser memory / HttpOnly cookie)
         │
         ▼
   All subsequent requests include:
   Authorization: Bearer <accessToken>
```

**JWT Claims:**
| Claim | Description |
|---|---|
| `sub` | User email |
| `userId` | UUID of the user |
| `role` | Single role string (e.g., `DEALER_MANAGER`) |
| `profileId` | UUID of role-specific profile |
| `dealerId` | Dealer UUID (for dealer roles) |
| `iat` | Issued at |
| `exp` | Expiry |

**JWT Secret:** Configured via `JWT_SECRET_KEY` environment variable (HS256 signing).

### OAuth2 Social Login

Supported providers configured in User Service:

| Provider | Grant Type | Redirect URI |
|---|---|---|
| Google | Authorization Code | Configurable via `GOOGLE_REDIRECT_URI` |
| Facebook | Authorization Code | Spring default callback |
| GitHub | Authorization Code | Spring default callback |

On successful OAuth2 login, the `OAuth2LoginSuccessHandler` maps the social identity to an internal user record and issues VoltNexus JWT tokens (same token structure as password login).

### Token Refresh

```
POST /auth/refresh
Authorization: Bearer <refreshToken>
→ Returns new accessToken + refreshToken
```

### Logout & Token Blacklisting

```
POST /auth/logout
Authorization: Bearer <accessToken>
→ Token is added to Redis blacklist → Gateway rejects future requests with it
```

**Blacklist TTL:** Matches `JWT_ACCESS_EXPIRATION_MS` (auto-expires from Redis).

---

## Gateway Security

### JwtGlobalFilter

The `JwtGlobalFilter` runs at order `-1` (highest priority) on every incoming request:

```
Request arrives
    │
    ├─► OPTIONS request? → Allow (CORS preflight)
    │
    ├─► Excluded path? → Allow (public endpoints)
    │
    └─► Extract Bearer token
            │
            ├─► Token in Redis blacklist? → 401 TOKEN_LOGGED_OUT
            ├─► Token expired? → 401 TOKEN_EXPIRED
            ├─► Token signature invalid? → 401 TOKEN_INVALID
            │
            └─► Valid → Mutate request with identity headers:
                    X-User-Email
                    X-User-Role
                    X-User-Id
                    X-User-ProfileId
                    X-User-DealerId
                    → Forward to downstream service
```

### Excluded Paths (Public Routes)

```
/auth/login
/auth/register/customer
/auth/forgot-password
/auth/reset-password
/auth/oauth2/**
/oauth2/**
/login/**
/users/register/admin          ← Bootstrap only
/charging-stations             ← Public EV station info
/vehicle-catalog               ← Public catalog
/ai/chat/ask                   ← Rate-limited chatbot
/actuator/health               ← Health checks
/v3/api-docs, /swagger-ui/**   ← API docs
/sales/promotions/active        ← Public promotions
/payments/.../vnpay-return     ← Payment callbacks (VNPay)
/payments/.../vnpay-ipn        ← Payment IPN (VNPay)
```

---

## Service-Level Authorization

### Pattern

All downstream services implement a `JwtAuthenticationFilter` that reads `X-User-Email` and `X-User-Role` headers (pre-validated by Gateway) and creates a Spring Security `Authentication` context:

```java
// JwtAuthenticationFilter reads headers, not JWT directly
String email = request.getHeader("X-User-Email");
String role = request.getHeader("X-User-Role");
// → Sets SecurityContextHolder with UsernamePasswordAuthenticationToken
```

### Role Definitions

| Role | Assigned To | Primary Capabilities |
|---|---|---|
| `ADMIN` | System administrator | Full CRUD across all services |
| `EVM_STAFF` | Manufacturer staff | Order approval, inventory management, reporting |
| `DEALER_MANAGER` | Dealership manager | Dealer operations, staff management, contracts |
| `DEALER_STAFF` | Sales staff | Quotations, customer interaction, test drives |
| `CUSTOMER` | End customers | Browse, cart, test drives, B2C orders, payments |

### Authorization Annotations

Controllers use `@PreAuthorize` for declarative access control:

```java
// Examples from codebase:
@PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
@GetMapping("/stats/summary")
public ResponseEntity<?> getStats() { ... }

@PreAuthorize("hasAnyRole('ADMIN', 'DEALER_MANAGER', 'DEALER_STAFF')")
@PostMapping
public ResponseEntity<?> createCustomer() { ... }

@PreAuthorize("hasRole('CUSTOMER')")
@PostMapping("/orders/{orderId}/pay")
public ResponseEntity<?> pay() { ... }
```

---

## Password Security

- **Hashing Algorithm:** BCrypt (via Spring Security Crypto)
- Passwords never stored in plaintext
- Password comparison done exclusively in User Service
- Password reset uses time-limited, one-time tokens (via email)

---

## Secret Management

### Development

- Secrets stored in `./config/*.env` files (git-ignored)
- `dotenv-java` library loads `.env` files at startup
- Firebase service account JSON stored as local file in resources

### CI/CD

- All sensitive values stored as **GitHub Actions Secrets** (encrypted at rest)
- Secrets injected as environment variables at runtime
- Per-service secrets injected as Kubernetes Secrets at deploy time
- Firebase JSON injected dynamically: `echo "$FIREBASE_SERVICE_ACCOUNT_JSON" > firebase-service-account.json`

### Production (AWS EC2)

- Secrets stored in environment files on the EC2 instance
- Loaded via Docker Compose `env_file` directive
- GitHub `production` environment has protection rules (required reviewers)

**Critical Secrets:**
```
JWT_SECRET_KEY          ← HMAC signing key (high entropy, rotate periodically)
GOOGLE_CLIENT_SECRET    ← OAuth2 (revoke via Google Console if compromised)
VNPAY_HASH_SECRET       ← Payment gateway (revoke via VNPay if compromised)
FIREBASE_SERVICE_ACCOUNT_JSON ← Service account (revoke via Firebase Console)
DB_PASSWORD_*           ← Per-service database passwords
EC2_SSH_KEY             ← Private key for production SSH
```

---

## Rate Limiting

**Library:** Bucket4j 8.14.0 (in-memory + Redis-backed)

Applied at Gateway via custom `GuestRateLimitGatewayFilterFactory` on the `/ai/**` route:
- Limits unauthenticated (guest) access to AI chatbot
- Prevents abuse of the LLM API (cost control)
- Configuration: *per-IP token bucket* (Assumed based on structure)

---

## Payment Security (VNPay)

VNPay integration follows PCI-DSS-adjacent practices:
- Payment initiation from server-side only (no client-side secret exposure)
- IPN (Instant Payment Notification) callback from VNPay to server (not client)
- HMAC-SHA512 signature verification on all VNPay callbacks using `VNPAY_HASH_SECRET`
- Callback endpoints (`/vnpay-return`, `/vnpay-ipn`) are public but cryptographically verified

---

## Vulnerability Scanning

**Tool:** Trivy (Aqua Security) via `aquasecurity/trivy-action@master`

- Runs on every CI pipeline execution
- Scans the **filesystem** (source code + build artifacts)
- Reports CRITICAL and HIGH severity vulnerabilities
- `ignore-unfixed: true` — suppresses noise from unpatched upstream issues
- Currently informational (`exit-code: 0`) — can be tightened to block builds

---

## CORS Configuration

Configured globally at the Gateway level:

```properties
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowed-origins=${APP_CORS_ALLOWED_ORIGINS}
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowed-methods=*
spring.cloud.gateway.globalcors.cors-configurations.[/**].allowed-headers=*
spring.cloud.gateway.globalcors.cors-configurations.[/**].allow-credentials=true
```

- `allow-credentials=true` enables JWT cookie transmission
- `allowed-origins` is environment-specific (not wildcard in production)
- OPTIONS preflight requests are always allowed through `JwtGlobalFilter`

---

## Firebase Security (FCM)

- Firebase Admin SDK used server-to-server (not client-exposed)
- Service account JSON loaded at startup via classpath resource
- FCM tokens stored per-user in `user_devices` table
- Push notifications sent server-side only
- `FirebaseConfigTest` validates graceful startup when service account file is missing (CI-safe)

---

## Security Best Practices Checklist

| Practice | Status |
|---|---|
| JWT with short expiry + refresh rotation | ✅ Implemented |
| Token blacklisting on logout | ✅ Redis-backed blacklist |
| BCrypt password hashing | ✅ Spring Security Crypto |
| Role-based access control | ✅ `@PreAuthorize` per endpoint |
| CORS restriction | ✅ Configured (env-specific origins) |
| Secret externalization | ✅ Environment variables + GitHub Secrets |
| Vulnerability scanning | ✅ Trivy in CI |
| Payment signature verification | ✅ VNPay HMAC-SHA512 |
| OAuth2 social login | ✅ Google, Facebook, GitHub |
| Rate limiting | ✅ Bucket4j on AI endpoints |
| No database credentials in source | ✅ All via env vars |
| HTTPS enforcement | ⚠️ Assumed at load balancer (EC2/ALB layer) |
| SQL Injection protection | ✅ JPA/Hibernate parameterized queries |
| Static analysis | ✅ SonarCloud quality gate |
