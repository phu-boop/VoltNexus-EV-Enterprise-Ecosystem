# Testing — VoltNexus EV Enterprise Ecosystem

## Testing Strategy Overview

VoltNexus employs a **multi-layer testing strategy** covering unit tests, controller/integration tests, BVA (Boundary Value Analysis) tests, and API contract tests via Newman/Postman. There are **76+ test files** spread across all 9 Java services.

---

## Test Summary by Service

| Service | Test Files | Key Coverage Areas |
|---|---|---|
| User Service | 10+ | Auth, JWT, OAuth2, BVA registration, Firebase config |
| Customer Service | 10+ | Controllers, clients, specs, entities, scheduler |
| Sales Service | 3+ | Promotions, order flow |
| Vehicle Service | 2+ | Image controller, catalog |
| Payment Service | 4+ | Admin, dealer, customer, VNPay |
| Inventory Service | 4+ | Service impl, BVA, security config, controller |
| Dealer Service | 2+ | Controller, BVA |
| Reporting Service | 8+ | Controllers, services, BVA |
| AI Service | 2+ | Production plan, test controller |
| Gateway | 3+ | JWT filter, util, exception handler |

---

## Unit Tests

### Framework & Tools

| Tool | Version | Purpose |
|---|---|---|
| JUnit 5 | Via Spring Boot | Test runner |
| Mockito | Via Spring Boot | Mocking dependencies |
| Spring Boot Test | 3.5.6 | Context loading, `@SpringBootTest` |
| H2 Database | Via Spring Boot | In-memory DB for JPA tests |
| AssertJ | Via Spring Boot | Fluent assertions |
| Reactor Test | Latest | Testing WebFlux reactive flows |

### Test Database Configuration

All services that require JPA in tests use **H2 in-memory database**:

```properties
# src/test/resources/application.properties (typical)
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
```

### Key Unit Test Examples

#### Auth Service Tests (`AuthServiceTest.java`)
```java
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock UserRepository userRepository;
    @Mock JwtUtil jwtUtil;
    @Mock PasswordEncoder passwordEncoder;
    
    @Test
    void login_success_returnsTokens() { ... }
    
    @Test
    void login_invalidPassword_throwsException() { ... }
}
```

#### Inventory Service Tests (`InventoryServiceImplTest.java`)
- Tests allocation, deallocation, stock validation
- Mocks `InventoryRepository` and `KafkaTemplate`
- Covers edge cases: zero stock, over-allocation

#### Customer Service Tests
```java
// CustomerControllerTest.java - uses @WebMvcTest
@WebMvcTest(CustomerController.class)
class CustomerControllerTest {
    @MockBean CustomerService customerService;
    // Tests: GET /customers, POST /customers, DELETE /{id}
}
```

---

## Boundary Value Analysis (BVA) Tests

A notable testing practice in this codebase is **systematic BVA testing** — testing boundary condition inputs for validation rules.

### Identified BVA Test Files

| File | Service | What It Tests |
|---|---|---|
| `BVA_CustomerRegistrationTest.java` | User Service | Email format, password length bounds |
| `BVA_CustomerRequestTest.java` | Customer Service | Request field boundary conditions |
| `InventoryBvaControllerTest.java` | Inventory Service | Quantity boundaries (0, 1, max) |
| `SalesRecordRequestBVATest.java` | Reporting Service | Date ranges, amount bounds |
| `UserBVATest.java` | User Service | Username/field length validation |
| `DealerControllerWebMvcTest.java` | Dealer Service | WebMvcTest with boundary inputs |

### BVA Test Pattern

```java
@ParameterizedTest
@ValueSource(strings = {"", "a", "ab"})  // Below min
void createCustomer_withInvalidName_returns400(String name) {
    // BVA: minimum = 3 characters
}

@ParameterizedTest
@ValueSource(strings = {"validname", "longvalidname"})  // Valid
void createCustomer_withValidName_returns201(String name) { ... }
```

---

## Controller / Integration Tests

### Approach: `@WebMvcTest`

Controller tests use `@WebMvcTest` with `@MockBean` service dependencies:

```java
@WebMvcTest(PaymentController.class)
@Import(TestSecurityConfig.class)
class CustomerPaymentControllerTest {
    
    @Autowired MockMvc mockMvc;
    @MockBean CustomerPaymentService paymentService;
    
    @Test
    void payOrder_withValidRequest_returns200() throws Exception {
        mockMvc.perform(post("/api/v1/payments/customer/orders/{id}/pay", orderId)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson))
            .andExpect(status().isOk());
    }
}
```

### Security Configuration in Tests

Tests that require Spring Security use a simplified `TestSecurityConfig`:
```java
@TestConfiguration
class TestSecurityConfig {
    @Bean
    SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
        return http.csrf().disable()
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            .build();
    }
}
```

---

## Service Client Tests

Customer Service tests external service clients:

| File | Tests |
|---|---|
| `UserServiceClientTest.java` | REST calls to User Service (mocked) |
| `NotificationServiceClientTest.java` | Notification REST calls (mocked) |

Pattern: `@SpringBootTest` with `WireMock` or `RestClientTest` (Assumed based on structure).

---

## Specification / Repository Tests

```java
// TestDriveSpecificationTest.java
class TestDriveSpecificationTest {
    // Tests JPA Specifications used for dynamic filtering
    @Test
    void filterByDealer_returnsOnlyDealerAppointments() { ... }
    
    @Test
    void filterByDateRange_returnsAppointmentsInRange() { ... }
}
```

---

## Gateway Tests

The gateway has its own test suite:

| File | What It Tests |
|---|---|
| `JwtGlobalFilterTest.java` | JWT validation, blacklist check, header mutation |
| `JwtUtilTest.java` | Token generation, expiry, claim extraction |
| `GatewayExceptionHandlerTest.java` | Error response formatting |

```java
@WebFluxTest(JwtGlobalFilter.class)
class JwtGlobalFilterTest {
    @Test
    void filter_withValidToken_passesThrough() { ... }
    
    @Test
    void filter_withBlacklistedToken_returns401() { ... }
    
    @Test
    void filter_withExpiredToken_returnsTokenExpiredError() { ... }
}
```

---

## Frontend Tests

### Framework
- **Jest** + **React Testing Library** (standard Create React App / Vite setup)

### Execution
```bash
# Admin app
cd frontend/my-app && npm test -- --watchAll=false

# Customer app
cd frontend/customer-app && npm test -- --watchAll=false
```

Both frontend apps run tests in CI as part of the `CI: Frontend Test` step.

---

## API Integration Tests (Newman / Postman)

### Setup

```bash
# Install Postman CLI
curl -o- "https://dl-cli.pstmn.io/install/linux64.sh" | sh

# Install Newman + HTML reporter
npm install -g newman newman-reporter-htmlextra
```

### Execution

```bash
# Port-forward staging gateway
kubectl port-forward svc/gateway 8080:8080 -n voltnexus &

# Run Postman collection from Postman Cloud
newman run "https://api.getpostman.com/collections/<collection-id>?apikey=$POSTMAN_API_KEY" \
  -e "https://api.getpostman.com/environments/<env-id>?apikey=$POSTMAN_API_KEY" \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export newman/report.html
```

### Report Publishing

Test reports are published to **GitHub Pages** after every run:
- Branch: `gh-pages`
- File: `report.html`
- URL: `https://<owner>.github.io/<repo>/report.html`

### Postman Collections Location

```
postman/         ← Collection JSON files (for local use)
Postman-json/    ← Additional collection exports
```

---

## Code Coverage

### Tool: JaCoCo (`jacoco-maven-plugin:0.8.12`)

Configured in the parent `pom.xml` and inherited by all modules:

```xml
<execution>
  <goals><goal>prepare-agent</goal></goals>
</execution>
<execution>
  <id>report</id>
  <phase>test</phase>
  <goals><goal>report</goal></goals>
</execution>
```

Coverage reports generated at: `target/site/jacoco/jacoco.xml`

These XML reports are consumed by SonarCloud for coverage analysis:
```
-Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml
```

### Running Coverage Locally

```bash
# Run tests + generate coverage report
mvn test

# View HTML report
open services/user-service/target/site/jacoco/index.html
```

---

## E2E Testing (Planned)

The CI pipeline has a placeholder for E2E tests:

```yaml
- name: "E2E Test: Web Application Verification"
  run: |
    echo "Running Playwright/Cypress E2E tests..."
    # npm run e2e || true
```

E2E framework selection (Playwright or Cypress) is pending full implementation.

---

## Running All Tests Locally

```bash
# Build common-lib first
mvn clean install -pl common-lib -DskipTests

# Run all unit tests (skip integration tests)
mvn test -DskipITs

# Run tests for a specific service
mvn test -pl services/user-service

# Run with coverage
mvn test jacoco:report -pl services/user-service

# Frontend tests
cd frontend/my-app && npm test -- --watchAll=false --coverage
```
