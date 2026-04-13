package com.example.reporting_service.bva;

import com.example.reporting_service.dto.SalesRecordRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * =====================================================================
 * BVA (Boundary Value Analysis) Test – Thành viên 7
 * Phạm vi: reporting-service → DTO SalesRecordRequest
 * =====================================================================
 *
 * Các trường được kiểm thử BVA:
 *
 * 1. orderId        : @NotNull → null (invalid) vs UUID hợp lệ (valid)
 *
 * 2. totalAmount    : @DecimalMin("0.00")
 *                     BVA boundaries: -0.01 | 0.00 | 0.01
 *
 * 3. dealerName     : @Size(max = 200)
 *                     BVA boundaries: 199 ký tự | 200 ký tự | 201 ký tự
 *
 * 4. modelName      : @Size(max = 200)
 *                     BVA boundaries: 199 ký tự | 200 ký tự | 201 ký tự
 *
 * 5. region         : @Size(max = 100)
 *                     BVA boundaries: 99 ký tự  | 100 ký tự  | 101 ký tự
 *
 * Quy ước:
 *  - Giá trị vi phạm biên → expect: có ConstraintViolation (400 Bad Request)
 *  - Giá trị nằm trong biên → expect: không có ConstraintViolation (2xx Success)
 * =====================================================================
 */
@DisplayName("BVA Test – SalesRecordRequest (Thành viên 7 – reporting-service)")
class SalesRecordRequestBVATest {

    private static Validator validator;

    @BeforeAll
    static void setupValidator() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────────────────────────────────

    /** Tạo request hợp lệ mặc định để làm base cho từng test case. */
    private SalesRecordRequest validRequest() {
        return SalesRecordRequest.builder()
                .orderId(UUID.randomUUID())
                .totalAmount(new BigDecimal("100.00"))
                .orderDate(LocalDateTime.now())
                .dealerName("Default Dealer")
                .variantId(1L)
                .modelName("VoltNexus X1")
                .region("Hanoi")
                .build();
    }

    private Set<ConstraintViolation<SalesRecordRequest>> validate(SalesRecordRequest req) {
        return validator.validate(req);
    }

    private String repeat(char c, int times) {
        return String.valueOf(c).repeat(times);
    }

    // =========================================================================
    // 1. orderId – @NotNull
    // =========================================================================

    @Nested
    @DisplayName("1. orderId – @NotNull")
    class OrderIdTests {

        @Test
        @DisplayName("BVA-RPT-01 | orderId = null → INVALID (vi phạm @NotNull)")
        void orderId_null_shouldFail() {
            SalesRecordRequest req = validRequest();
            req.setOrderId(null);

            Set<ConstraintViolation<SalesRecordRequest>> violations = validate(req);

            assertThat(violations)
                    .isNotEmpty()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("orderId")
                            && v.getMessage().contains("bắt buộc"));
        }

        @Test
        @DisplayName("BVA-RPT-02 | orderId = UUID hợp lệ → VALID")
        void orderId_valid_shouldPass() {
            SalesRecordRequest req = validRequest();
            req.setOrderId(UUID.randomUUID());

            Set<ConstraintViolation<SalesRecordRequest>> violations = validate(req);

            assertThat(violations).isEmpty();
        }
    }

    // =========================================================================
    // 2. totalAmount – @DecimalMin("0.00")
    //    Biên: -0.01 (invalid) | 0.00 (min hợp lệ) | 0.01 (valid)
    // =========================================================================

    @Nested
    @DisplayName("2. totalAmount – @DecimalMin(\"0.00\")")
    class TotalAmountTests {

        @Test
        @DisplayName("BVA-RPT-03 | totalAmount = -0.01 (Min-1) → INVALID")
        void totalAmount_minMinusOne_shouldFail() {
            SalesRecordRequest req = validRequest();
            req.setTotalAmount(new BigDecimal("-0.01"));

            Set<ConstraintViolation<SalesRecordRequest>> violations = validate(req);

            assertThat(violations)
                    .isNotEmpty()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("totalAmount"));
        }

        @Test
        @DisplayName("BVA-RPT-04 | totalAmount = 0.00 (Min) → VALID")
        void totalAmount_min_shouldPass() {
            SalesRecordRequest req = validRequest();
            req.setTotalAmount(new BigDecimal("0.00"));

            Set<ConstraintViolation<SalesRecordRequest>> violations = validate(req);

            assertThat(violations).isEmpty();
        }

        @Test
        @DisplayName("BVA-RPT-05 | totalAmount = 0.01 (Min+1) → VALID")
        void totalAmount_minPlusOne_shouldPass() {
            SalesRecordRequest req = validRequest();
            req.setTotalAmount(new BigDecimal("0.01"));

            Set<ConstraintViolation<SalesRecordRequest>> violations = validate(req);

            assertThat(violations).isEmpty();
        }
    }

    // =========================================================================
    // 3. dealerName – @Size(max = 200)
    //    Biên: 199 (valid) | 200 (max valid) | 201 (invalid)
    // =========================================================================

    @Nested
    @DisplayName("3. dealerName – @Size(max = 200)")
    class DealerNameTests {

        @Test
        @DisplayName("BVA-RPT-06 | dealerName.length = 199 (Max-1) → VALID")
        void dealerName_maxMinusOne_shouldPass() {
            SalesRecordRequest req = validRequest();
            req.setDealerName(repeat('A', 199));

            Set<ConstraintViolation<SalesRecordRequest>> violations = validate(req);

            assertThat(violations).isEmpty();
        }

        @Test
        @DisplayName("BVA-RPT-07 | dealerName.length = 200 (Max) → VALID")
        void dealerName_max_shouldPass() {
            SalesRecordRequest req = validRequest();
            req.setDealerName(repeat('A', 200));

            Set<ConstraintViolation<SalesRecordRequest>> violations = validate(req);

            assertThat(violations).isEmpty();
        }

        @Test
        @DisplayName("BVA-RPT-08 | dealerName.length = 201 (Max+1) → INVALID")
        void dealerName_maxPlusOne_shouldFail() {
            SalesRecordRequest req = validRequest();
            req.setDealerName(repeat('A', 201));

            Set<ConstraintViolation<SalesRecordRequest>> violations = validate(req);

            assertThat(violations)
                    .isNotEmpty()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("dealerName"));
        }
    }

    // =========================================================================
    // 4. modelName – @Size(max = 200)
    //    Biên: 199 (valid) | 200 (max valid) | 201 (invalid)
    // =========================================================================

    @Nested
    @DisplayName("4. modelName – @Size(max = 200)")
    class ModelNameTests {

        @Test
        @DisplayName("BVA-RPT-09 | modelName.length = 199 (Max-1) → VALID")
        void modelName_maxMinusOne_shouldPass() {
            SalesRecordRequest req = validRequest();
            req.setModelName(repeat('M', 199));

            Set<ConstraintViolation<SalesRecordRequest>> violations = validate(req);

            assertThat(violations).isEmpty();
        }

        @Test
        @DisplayName("BVA-RPT-10 | modelName.length = 200 (Max) → VALID")
        void modelName_max_shouldPass() {
            SalesRecordRequest req = validRequest();
            req.setModelName(repeat('M', 200));

            Set<ConstraintViolation<SalesRecordRequest>> violations = validate(req);

            assertThat(violations).isEmpty();
        }

        @Test
        @DisplayName("BVA-RPT-11 | modelName.length = 201 (Max+1) → INVALID")
        void modelName_maxPlusOne_shouldFail() {
            SalesRecordRequest req = validRequest();
            req.setModelName(repeat('M', 201));

            Set<ConstraintViolation<SalesRecordRequest>> violations = validate(req);

            assertThat(violations)
                    .isNotEmpty()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("modelName"));
        }
    }

    // =========================================================================
    // 5. region – @Size(max = 100)
    //    Biên: 99 (valid) | 100 (max valid) | 101 (invalid)
    // =========================================================================

    @Nested
    @DisplayName("5. region – @Size(max = 100)")
    class RegionTests {

        @Test
        @DisplayName("BVA-RPT-12 | region.length = 99 (Max-1) → VALID")
        void region_maxMinusOne_shouldPass() {
            SalesRecordRequest req = validRequest();
            req.setRegion(repeat('R', 99));

            Set<ConstraintViolation<SalesRecordRequest>> violations = validate(req);

            assertThat(violations).isEmpty();
        }

        @Test
        @DisplayName("BVA-RPT-13 | region.length = 100 (Max) → VALID")
        void region_max_shouldPass() {
            SalesRecordRequest req = validRequest();
            req.setRegion(repeat('R', 100));

            Set<ConstraintViolation<SalesRecordRequest>> violations = validate(req);

            assertThat(violations).isEmpty();
        }

        @Test
        @DisplayName("BVA-RPT-14 | region.length = 101 (Max+1) → INVALID")
        void region_maxPlusOne_shouldFail() {
            SalesRecordRequest req = validRequest();
            req.setRegion(repeat('R', 101));

            Set<ConstraintViolation<SalesRecordRequest>> violations = validate(req);

            assertThat(violations)
                    .isNotEmpty()
                    .anyMatch(v -> v.getPropertyPath().toString().equals("region"));
        }
    }

    // =========================================================================
    // 6. Parameterized tổng hợp – kiểm thử toàn bộ biên trên 1 lần chạy
    // =========================================================================

    @Nested
    @DisplayName("6. Parameterized Summary – All BVA Boundaries")
    class ParameterizedBVASummary {

        static Stream<Arguments> totalAmountBoundaries() {
            return Stream.of(
                    Arguments.of(new BigDecimal("-0.01"), true,  "BVA-RPT-P01 | -0.01 (Min-1) → INVALID"),
                    Arguments.of(new BigDecimal("0.00"),  false, "BVA-RPT-P02 | 0.00  (Min)   → VALID"),
                    Arguments.of(new BigDecimal("0.01"),  false, "BVA-RPT-P03 | 0.01  (Min+1) → VALID")
            );
        }

        @ParameterizedTest(name = "{2}")
        @MethodSource("totalAmountBoundaries")
        void totalAmount_parameterized(BigDecimal amount, boolean expectViolation, String label) {
            SalesRecordRequest req = validRequest();
            req.setTotalAmount(amount);
            Set<ConstraintViolation<SalesRecordRequest>> violations = validate(req);

            if (expectViolation) {
                assertThat(violations)
                        .as("Expect violation for: %s", label)
                        .isNotEmpty();
            } else {
                assertThat(violations)
                        .as("Expect no violation for: %s", label)
                        .isEmpty();
            }
        }

        static Stream<Arguments> stringFieldBoundaries() {
            return Stream.of(
                    // dealerName – max 200
                    Arguments.of("dealerName", 199, false, "BVA-RPT-P04 | dealerName 199 (Max-1) → VALID"),
                    Arguments.of("dealerName", 200, false, "BVA-RPT-P05 | dealerName 200 (Max)   → VALID"),
                    Arguments.of("dealerName", 201, true,  "BVA-RPT-P06 | dealerName 201 (Max+1) → INVALID"),
                    // modelName – max 200
                    Arguments.of("modelName",  199, false, "BVA-RPT-P07 | modelName  199 (Max-1) → VALID"),
                    Arguments.of("modelName",  200, false, "BVA-RPT-P08 | modelName  200 (Max)   → VALID"),
                    Arguments.of("modelName",  201, true,  "BVA-RPT-P09 | modelName  201 (Max+1) → INVALID"),
                    // region – max 100
                    Arguments.of("region",      99, false, "BVA-RPT-P10 | region      99 (Max-1) → VALID"),
                    Arguments.of("region",     100, false, "BVA-RPT-P11 | region     100 (Max)   → VALID"),
                    Arguments.of("region",     101, true,  "BVA-RPT-P12 | region     101 (Max+1) → INVALID")
            );
        }

        @ParameterizedTest(name = "{3}")
        @MethodSource("stringFieldBoundaries")
        void stringField_parameterized(String field, int length, boolean expectViolation, String label)
                throws Exception {
            SalesRecordRequest req = validRequest();
            String value = "A".repeat(length);

            // Set field dynamically via reflection
            var setter = SalesRecordRequest.class.getMethod(
                    "set" + Character.toUpperCase(field.charAt(0)) + field.substring(1),
                    String.class);
            setter.invoke(req, value);

            Set<ConstraintViolation<SalesRecordRequest>> violations = validate(req);

            if (expectViolation) {
                assertThat(violations)
                        .as("Expect violation for: %s", label)
                        .isNotEmpty()
                        .anyMatch(v -> v.getPropertyPath().toString().equals(field));
            } else {
                assertThat(violations)
                        .as("Expect no violation for: %s", label)
                        .isEmpty();
            }
        }
    }
}
