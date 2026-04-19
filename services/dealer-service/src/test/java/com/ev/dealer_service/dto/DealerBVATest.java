package com.ev.dealer_service.dto;

import com.ev.dealer_service.dto.request.DealerContractRequest;
import com.ev.dealer_service.dto.request.DealerRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * <h2>BVA — Boundary Value Analysis (phân tích giá trị biên)</h2>
 * <p>
 * Mục tiêu: kiểm tra các annotation Jakarta Bean Validation trên DTO bằng cách chọn
 * điểm ngay sát biên hợp lệ (min/max) và ngay ngoài biên — pattern chuẩn trong kiểm thử phần mềm.
 * </p>
 * <p>
 * <b>Tham số nguồn sự thật</b> (khớp {@link DealerRequest}, {@link com.ev.dealer_service.dto.request.DealerContractRequest}):
 * </p>
 * <ul>
 *   <li>{@link #MAX_DEALER_CODE} — {@code @Size(max=50)} trên {@code dealerCode}</li>
 *   <li>{@link #MAX_DEALER_NAME} — {@code @Size(max=200)} trên {@code dealerName}</li>
 *   <li>{@link #MAX_ADDRESS}, {@link #MAX_CITY}, {@link #MAX_REGION}, {@link #MAX_PHONE}, {@link #MAX_EMAIL}, {@link #MAX_TAX}</li>
 *   <li>{@link #MAX_CONTRACT_NUMBER} — {@code @Size(max=100)}</li>
 *   <li>{@link #MAX_CONTRACT_STATUS} — {@code @Size(max=20)}</li>
 *   <li>{@link com.ev.dealer_service.dto.request.DealerContractRequest}: {@code targetSales} &gt; 0 (exclusive {@code @DecimalMin})</li>
 * </ul>
 * <p>
 * Không cần Spring context — chỉ dùng {@link Validator} thuần, chạy nhanh trên CI.
 * </p>
 */
@DisplayName("BVA — Bean Validation trên DealerRequest / DealerContractRequest")
class DealerBVATest {

    /** Khớp {@code DealerRequest.dealerCode} — @Size(max = 50) */
    static final int MAX_DEALER_CODE = 50;
    /** Khớp {@code DealerRequest.dealerName} — @Size(max = 200) */
    static final int MAX_DEALER_NAME = 200;
    /** Khớp {@code DealerRequest.address} — @Size(max = 500) */
    static final int MAX_ADDRESS = 500;
    /** Khớp {@code DealerRequest.city} / {@code region} — @Size(max = 100) */
    static final int MAX_CITY_REGION = 100;
    /** Khớp {@code DealerRequest.phone} — @Size(max = 20) */
    static final int MAX_PHONE = 20;
    /** Khớp {@code DealerRequest.email} — @Size(max = 100) */
    static final int MAX_EMAIL = 100;
    /** Khớp {@code DealerRequest.taxNumber} — @Size(max = 50) */
    static final int MAX_TAX = 50;

    /** Khớp {@code DealerContractRequest.contractNumber} — @Size(max = 100) */
    static final int MAX_CONTRACT_NUMBER = 100;
    /** Khớp {@code DealerContractRequest.contractStatus} — @Size(max = 20) */
    static final int MAX_CONTRACT_STATUS = 20;

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    // --- Helpers: request tối thiểu hợp lệ, chỉ thay một field để cô lập BVA ---

    private static DealerRequest minimalValidDealerRequest() {
        DealerRequest r = new DealerRequest();
        r.setDealerCode("D-CODE");
        r.setDealerName("Dealer Name");
        return r;
    }

    /**
     * Hợp đồng đủ field bắt buộc (@NotNull / @NotBlank / @DecimalMin) để khi đổi một biên (ví dụ độ dài status)
     * không bị lỗi dồn từ field khác.
     */
    private static DealerContractRequest minimalValidContractRequest() {
        DealerContractRequest r = new DealerContractRequest();
        r.setDealerId(UUID.fromString("550e8400-e29b-41d4-a716-446655440000"));
        r.setContractNumber("CT-BASE-001");
        r.setContractTerms("Terms");
        r.setTargetSales(new BigDecimal("1"));
        r.setCommissionRate(BigDecimal.ZERO);
        r.setStartDate(LocalDate.of(2025, 1, 1));
        r.setEndDate(LocalDate.of(2026, 12, 31));
        r.setContractStatus("ACTIVE");
        return r;
    }

    private static boolean hasViolationOnProperty(Set<? extends ConstraintViolation<?>> violations, String property) {
        return violations.stream().anyMatch(v -> property.equals(v.getPropertyPath().toString()));
    }

    private static String violationsSummary(Set<? extends ConstraintViolation<?>> violations) {
        return violations.stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .collect(Collectors.joining("; "));
    }

    @Nested
    @DisplayName("DealerRequest — dealerCode (@NotBlank + @Size max=50)")
    class DealerCodeBva {

        /**
         * Kiểm tra biên độ dài của dealerCode
         * - Tham số: int length (Độ dài chuỗi), boolean expectValid (Kỳ vọng hợp lệ hay không)
         * - Mục tiêu: Xác minh annotation @Size(max=50) hoạt động đúng tại các điểm biên (49, 50, 51).
         * - Cách thức: Tạo chuỗi lặp lại ký tự 'C' với độ dài tương ứng, thực hiện validate và kiểm tra vi phạm (violation).
         * - Kết quả mong đợi: 49 và 50 ký tự phải hợp lệ, 51 ký tự phải bị vi phạm lỗi validation.
         */
        @ParameterizedTest(name = "dealerCode length={0} → expectValid={1}")
        @CsvSource({
                "49, true",
                "50, true",
                "51, false"
        })
        @DisplayName("Biên độ dài: 49 (max-1), 50 (max), 51 (max+1)")
        void dealerCode_lengthBoundaries(int length, boolean expectValid) {
            DealerRequest r = minimalValidDealerRequest();
            r.setDealerCode("C".repeat(length));

            Set<ConstraintViolation<DealerRequest>> v = validator.validate(r);
            boolean badCode = hasViolationOnProperty(v, "dealerCode");

            if (expectValid) {
                assertFalse(badCode, () -> "Expected valid dealerCode length " + length + " but: " + violationsSummary(cast(v)));
            } else {
                assertTrue(badCode, "Expected violation on dealerCode for length " + length);
            }
        }
    }

    @Nested
    @DisplayName("DealerRequest — dealerName (@NotBlank + @Size max=200)")
    class DealerNameBva {

        @ParameterizedTest(name = "dealerName length={0} → expectValid={1}")
        @CsvSource({
                "199, true",
                "200, true",
                "201, false"
        })
        @DisplayName("Biên độ dài: 199, 200, 201")
        void dealerName_lengthBoundaries(int length, boolean expectValid) {
            DealerRequest r = minimalValidDealerRequest();
            r.setDealerName("N".repeat(length));

            Set<ConstraintViolation<DealerRequest>> v = validator.validate(r);
            boolean badName = hasViolationOnProperty(v, "dealerName");

            if (expectValid) {
                assertFalse(badName, () -> violationsSummary(cast(v)));
            } else {
                assertTrue(badName);
                assertTrue(v.stream().anyMatch(x -> x.getMessage().contains("200 characters")),
                        "Message should mention 200 char limit; got: " + violationsSummary(cast(v)));
            }
        }
    }

    @Nested
    @DisplayName("DealerRequest — các field optional @Size (address, city, …)")
    class DealerOptionalStringFieldsBva {

        /**
         * Kiểm tra biên độ dài của address
         * - Tham số: Không có (Sử dụng hằng số MAX_ADDRESS = 500)
         * - Mục tiêu: Xác minh @Size(max=500) trên trường address.
         * - Cách thức: Test với đúng 500 ký tự (lượt 1) và 501 ký tự (lượt 2).
         * - Kết quả mong đợi: 500 ký tự không có lỗi, 501 ký tự phải báo lỗi validation.
         */
        @Test
        @DisplayName("address: max 500 — 500 hợp lệ, 501 vi phạm")
        void address_boundary() {
            DealerRequest r = minimalValidDealerRequest();
            r.setAddress("A".repeat(MAX_ADDRESS));
            assertFalse(hasViolationOnProperty(validator.validate(r), "address"));

            r.setAddress("A".repeat(MAX_ADDRESS + 1));
            assertTrue(hasViolationOnProperty(validator.validate(r), "address"));
        }

        @Test
        @DisplayName("city / region: max 100")
        void cityAndRegion_boundary() {
            DealerRequest r = minimalValidDealerRequest();
            r.setCity("C".repeat(MAX_CITY_REGION));
            r.setRegion("R".repeat(MAX_CITY_REGION));
            Set<ConstraintViolation<DealerRequest>> v = validator.validate(r);
            assertFalse(hasViolationOnProperty(v, "city"));
            assertFalse(hasViolationOnProperty(v, "region"));

            r.setCity("C".repeat(MAX_CITY_REGION + 1));
            assertTrue(hasViolationOnProperty(validator.validate(r), "city"));
        }

        @Test
        @DisplayName("phone: max 20")
        void phone_boundary() {
            DealerRequest r = minimalValidDealerRequest();
            r.setPhone("0".repeat(MAX_PHONE));
            assertFalse(hasViolationOnProperty(validator.validate(r), "phone"));
            r.setPhone("0".repeat(MAX_PHONE + 1));
            assertTrue(hasViolationOnProperty(validator.validate(r), "phone"));
        }

        @Test
        @DisplayName("email: @Email + @Size max 100 — email hợp lệ gần biên độ dài")
        void email_sizeAndFormat() {
            DealerRequest r = minimalValidDealerRequest();
            // Phần local (RFC) thường ≤ 64 ký tự với @Email; 64 + "@x.co" (5) = 69, vẫn dưới @Size(100)
            String local = "a".repeat(64);
            r.setEmail(local + "@x.co");
            assertEquals(69, r.getEmail().length());
            assertFalse(hasViolationOnProperty(validator.validate(r), "email"));

            r.setEmail("not-an-email");
            assertTrue(hasViolationOnProperty(validator.validate(r), "email"));
        }

        @Test
        @DisplayName("taxNumber: max 50")
        void taxNumber_boundary() {
            DealerRequest r = minimalValidDealerRequest();
            r.setTaxNumber("T".repeat(MAX_TAX));
            assertFalse(hasViolationOnProperty(validator.validate(r), "taxNumber"));
            r.setTaxNumber("T".repeat(MAX_TAX + 1));
            assertTrue(hasViolationOnProperty(validator.validate(r), "taxNumber"));
        }
    }

    @Nested
    @DisplayName("DealerContractRequest — contractNumber (@NotBlank + @Size max=100)")
    class ContractNumberBva {

        @ParameterizedTest(name = "contractNumber length={0} → expectValid={1}")
        @CsvSource({
                "99, true",
                "100, true",
                "101, false"
        })
        void contractNumber_lengthBoundaries(int length, boolean expectValid) {
            DealerContractRequest r = minimalValidContractRequest();
            r.setContractNumber("N".repeat(length));

            Set<ConstraintViolation<DealerContractRequest>> v = validator.validate(r);
            boolean bad = hasViolationOnProperty(cast(v), "contractNumber");

            if (expectValid) {
                assertFalse(bad, violationsSummary(cast(v)));
            } else {
                assertTrue(bad);
            }
        }
    }

    @Nested
    @DisplayName("DealerContractRequest — contractStatus (@Size max=20)")
    class ContractStatusBva {

        @ParameterizedTest(name = "contractStatus length={0} → expectValid={1}")
        @CsvSource({
                "19, true",
                "20, true",
                "21, false"
        })
        void contractStatus_lengthBoundaries(int length, boolean expectValid) {
            DealerContractRequest r = minimalValidContractRequest();
            r.setContractStatus("S".repeat(length));

            Set<ConstraintViolation<DealerContractRequest>> v = validator.validate(r);
            boolean bad = hasViolationOnProperty(cast(v), "contractStatus");

            if (expectValid) {
                assertFalse(bad, violationsSummary(cast(v)));
            } else {
                assertTrue(bad);
            }
        }
    }

    @Nested
    @DisplayName("DealerContractRequest — targetSales (@DecimalMin exclusive 0)")
    class TargetSalesBva {

        /**
         * Kiểm tra giá trị biên của targetSales (Doanh số mục tiêu)
         * - Tham số: String value (Các giá trị số: "0", "0.01", "1")
         * - Mục tiêu: Đảm bảo doanh số mục tiêu phải lớn hơn 0 (@DecimalMin(value="0", inclusive=false)).
         * - Cách thức: Chạy test với các giá trị sát biên 0.
         * - Kết quả mong đợi: Giá trị 0 phải bị lỗi, 0.01 và 1 phải hợp lệ.
         */
        @ParameterizedTest(name = "targetSales={0} → expectValid={1}")
        @CsvSource({
                "0, false",
                "0.00, false",
                "0.01, true",
                "1, true"
        })
        void targetSales_mustBeStrictlyPositive(String value, boolean expectValid) {
            DealerContractRequest r = minimalValidContractRequest();
            r.setTargetSales(new BigDecimal(value));

            Set<ConstraintViolation<DealerContractRequest>> v = validator.validate(r);
            boolean bad = hasViolationOnProperty(cast(v), "targetSales");

            if (expectValid) {
                assertFalse(bad, violationsSummary(cast(v)));
            } else {
                assertTrue(bad);
            }
        }
    }

    @Nested
    @DisplayName("DealerContractRequest — commissionRate (@DecimalMin inclusive 0)")
    class CommissionRateBva {

        @ParameterizedTest
        @ValueSource(strings = {"0", "0.0", "10.5"})
        @DisplayName("commissionRate >= 0 hợp lệ")
        void commissionRate_nonNegative_ok(String value) {
            DealerContractRequest r = minimalValidContractRequest();
            r.setCommissionRate(new BigDecimal(value));
            assertFalse(hasViolationOnProperty(cast(validator.validate(r)), "commissionRate"));
        }

        @Test
        @DisplayName("commissionRate âm → vi phạm")
        void commissionRate_negative_invalid() {
            DealerContractRequest r = minimalValidContractRequest();
            r.setCommissionRate(new BigDecimal("-0.01"));
            assertTrue(hasViolationOnProperty(cast(validator.validate(r)), "commissionRate"));
        }
    }

    @Nested
    @DisplayName("DealerContractRequest — dealerId / startDate / endDate (@NotNull)")
    class ContractRequiredFieldsBva {

        @Test
        @DisplayName("dealerId null → vi phạm")
        void dealerId_required() {
            DealerContractRequest r = minimalValidContractRequest();
            r.setDealerId(null);
            assertTrue(hasViolationOnProperty(cast(validator.validate(r)), "dealerId"));
        }

        @Test
        @DisplayName("startDate / endDate null → vi phạm")
        void dates_required() {
            DealerContractRequest r = minimalValidContractRequest();
            r.setStartDate(null);
            assertTrue(hasViolationOnProperty(cast(validator.validate(r)), "startDate"));
            r = minimalValidContractRequest();
            r.setEndDate(null);
            assertTrue(hasViolationOnProperty(cast(validator.validate(r)), "endDate"));
        }
    }

    @SuppressWarnings("unchecked")
    private static <T> Set<ConstraintViolation<T>> cast(Set<?> v) {
        return (Set<ConstraintViolation<T>>) (Set<?>) v;
    }
}
