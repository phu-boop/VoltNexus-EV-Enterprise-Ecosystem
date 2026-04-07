# BUG REPORT - Reporting Service

## VoltNexus EV Enterprise Ecosystem

**Date:** 2026-03-23
**Service:** reporting-service
**Severity Levels:** CRITICAL | HIGH | MEDIUM | LOW

---

## TONG KET CAC LO HONG BAO MAT

| #   | Severity | Bug                      | File                         | Line          |
| --- | -------- | ------------------------ | ---------------------------- | ------------- |
| 1   | CRITICAL | Authentication Bypass    | SecurityConfig.java          | 26            |
| 2   | CRITICAL | Admin Auth Disabled      | AdminBackfillController.java | 48, 92        |
| 3   | CRITICAL | Missing Input Validation | SalesRecordRequest.java      | ALL           |
| 4   | HIGH     | Null Pointer Exception   | AdminBackfillController.java | 62, 105       |
| 5   | MEDIUM   | NumberFormatException    | ReportController.java        | 160, 163, 188 |
| 6   | MEDIUM   | Information Disclosure   | SalesReportingService.java   | 157           |
| 7   | LOW      | Missing Rate Limiting    | ReportingController.java     | 43            |

---

## CHI TIET CAC BUG

### BUG-01: CRITICAL - Authentication Bypass

**File:** `SecurityConfig.java:26`

```java
// HIEN TAI:
.authorizeHttpRequests(auth -> auth
    .anyRequest().permitAll() // <-- TẤT CẢ API KHÔNG CẦN AUTH!
);
```

**Van de:**

- Tat ca API deu co the truy cap ma khong can dang nhap
- Admin APIs (`/api/v1/admin/*`) khong duoc bao ve
- Sync APIs (`/api/sync/*`) co the bi abuse

**Fix:**

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
    .requestMatchers("/api/sync/**").hasRole("ADMIN")
    .requestMatchers("/api/reports/forecast/**").authenticated()
    .anyRequest().authenticated()
);
```

---

### BUG-02: CRITICAL - PreAuthorize Disabled

**File:** `AdminBackfillController.java:48, 92`

```java
// HIEN TAI:
@PostMapping("/dealers")
// @PreAuthorize("hasRole('ADMIN')") // BI COMMENT OUT!
@Transactional
public ResponseEntity<String> backfillDealers() {
```

**Van de:**

- Annotation bao mat bi comment
- Ai cung co the goi admin APIs

**Fix:**

```java
@PostMapping("/dealers")
@PreAuthorize("hasRole('ADMIN')") // UNCOMMENT THIS!
@Transactional
public ResponseEntity<String> backfillDealers() {
```

---

### BUG-03: CRITICAL - Missing Input Validation

**File:** `SalesRecordRequest.java`

```java
// HIEN TAI: KHONG CO VALIDATION
public class SalesRecordRequest {
    private UUID orderId;           // Co the null!
    private BigDecimal totalAmount; // Co the am!
    private String dealerName;      // Co the rong!
    private String region;          // Co the XSS!
}
```

**Van de:**

- Khong co validation annotations
- Co the insert du lieu khong hop le:
  - `totalAmount` am (VD: -999999999)
  - `orderId` null
  - `dealerName` rong hoac chua XSS
  - `orderDate` trong tuong lai (2099-12-31)

**Fix:**

```java
import jakarta.validation.constraints.*;

public class SalesRecordRequest {
    @NotNull(message = "orderId is required")
    private UUID orderId;

    @NotNull(message = "totalAmount is required")
    @Positive(message = "totalAmount must be positive")
    @DecimalMax(value = "9999999999999", message = "totalAmount too large")
    private BigDecimal totalAmount;

    @PastOrPresent(message = "orderDate cannot be in future")
    private LocalDateTime orderDate;

    @NotBlank(message = "dealerName is required")
    @Size(max = 255, message = "dealerName too long")
    @Pattern(regexp = "^[a-zA-Z0-9\\s\\-]+$", message = "Invalid characters")
    private String dealerName;

    @NotNull(message = "variantId is required")
    @Positive
    private Long variantId;

    @NotBlank(message = "modelName is required")
    private String modelName;

    @NotBlank(message = "region is required")
    private String region;
}
```

**Va trong Controller:**

```java
@PostMapping("/sales")
public ResponseEntity<String> reportSale(@Valid @RequestBody SalesRecordRequest request) {
    // @Valid se trigger validation
}
```

---

### BUG-04: HIGH - Null Pointer Exception

**File:** `AdminBackfillController.java:62, 105`

```java
// HIEN TAI:
ResponseEntity<ApiRespond<List<DealerBasicDto>>> response = restTemplate.exchange(...);
List<DealerBasicDto> allDealers = response.getBody().getData(); // NPE NEU getBody() NULL!
```

**Van de:**

- Khong check null truoc khi goi `getBody()`
- Neu service khac down -> NullPointerException -> 500

**Fix:**

```java
ResponseEntity<ApiRespond<List<DealerBasicDto>>> response = restTemplate.exchange(...);

if (response.getBody() == null) {
    log.error("Response body is null");
    return ResponseEntity.status(503).body("Service unavailable");
}

List<DealerBasicDto> allDealers = response.getBody().getData();
if (allDealers == null) {
    // handle...
}
```

---

### BUG-05: MEDIUM - NumberFormatException

**File:** `ReportController.java:160, 163, 188`

```java
// HIEN TAI:
if (modelId != null && !modelId.isEmpty()) {
    spec = spec.and((root, query, cb) ->
        cb.equal(root.get("modelId"), Long.valueOf(modelId))); // CRASH NEU "abc"!
}
```

**Van de:**

- `Long.valueOf("abc")` throw `NumberFormatException`
- Server tra ve 500 thay vi 400

**Test Case:**

```
GET /reports/central-inventory?modelId=abc_not_a_number
GET /reports/central-inventory?variantId=!@#$%^
```

**Fix:**

```java
if (modelId != null && !modelId.isEmpty()) {
    try {
        Long modelIdLong = Long.valueOf(modelId);
        spec = spec.and((root, query, cb) ->
            cb.equal(root.get("modelId"), modelIdLong));
    } catch (NumberFormatException e) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "modelId must be a valid number");
    }
}
```

---

### BUG-06: MEDIUM - Information Disclosure

**File:** `SalesReportingService.java:157`

```java
// HIEN TAI:
} catch (Exception e) {
    log.error("Failed to sync sales data", e);
    throw new RuntimeException("Sync failed: " + e.getMessage()); // LEAK INFO!
}
```

**Van de:**

- Exception message co the chua thong tin nhay cam:
  - Database connection strings
  - SQL queries
  - Internal IP addresses
  - Stack traces

**Fix:**

```java
} catch (Exception e) {
    log.error("Failed to sync sales data", e); // Log day du cho dev
    throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
        "Sync temporarily unavailable. Please try again later."); // Generic msg
}
```

---

### BUG-07: LOW - Missing Rate Limiting

**File:** `ReportingController.java:43`

```java
@PostMapping("/forecast")
public ResponseEntity<Map<String, String>> getForecast(...) {
    // KHONG CO RATE LIMIT!
    // Goi API Gemini -> TON TIEN
}
```

**Van de:**

- Attacker co the spam API forecast
- Moi request goi Gemini API -> Ton tien
- DoS attack potential

**Fix:**

```java
@PostMapping("/forecast")
@RateLimiter(name = "forecastLimit", fallbackMethod = "forecastFallback")
public ResponseEntity<Map<String, String>> getForecast(...) {
    // ...
}

public ResponseEntity<Map<String, String>> forecastFallback(String modelName,
        RequestNotPermitted ex) {
    return ResponseEntity.status(429)
        .body(Map.of("error", "Too many requests. Please try again later."));
}
```

---

## CAC TEST CASE DE TIM BUG

### Import file Postman:

```
BUG_HUNTING_Reporting_Service.json
```

### Chay test:

1. Import collection vao Postman
2. Set environment variable `url_reporting` = `http://localhost:8085`
3. Chay tung request de tim bugs
4. Xem ket qua trong tab "Tests"

### Cac test cases:

| Test                               | Expected | Bug neu |
| ---------------------------------- | -------- | ------- |
| POST /admin/backfill (no token)    | 401/403  | 200/400 |
| POST /sales (negative amount)      | 400      | 200     |
| POST /sales (null orderId)         | 400      | 500     |
| GET /central-inventory?modelId=abc | 400      | 500     |
| POST /sales (empty body)           | 400      | 500     |
| POST /sales (malformed JSON)       | 400      | 500     |
| POST /sales (XSS payload)          | 400      | 200     |

---

## PRIORITY FIX

1. **NGAY LAP TUC:**
   - Fix SecurityConfig.java - Enable authentication
   - Uncomment @PreAuthorize trong AdminBackfillController

2. **CAP BACH:**
   - Add validation vao SalesRecordRequest
   - Fix null checks trong backfill methods

3. **SAU DO:**
   - Handle NumberFormatException
   - Hide error details from responses
   - Add rate limiting

---

## CHECKLIST SAU KHI FIX

- [ ] SecurityConfig khong con `permitAll()`
- [ ] AdminBackfillController co `@PreAuthorize`
- [ ] SalesRecordRequest co validation annotations
- [ ] Controller co `@Valid` annotation
- [ ] Tat ca external service calls check null
- [ ] NumberFormatException duoc handle
- [ ] Error messages khong leak internal info
- [ ] Rate limiting cho AI endpoints
- [ ] Chay lai tat ca test cases -> PASS
