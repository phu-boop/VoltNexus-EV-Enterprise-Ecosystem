package com.ev.user_service.dto;

import com.ev.user_service.dto.request.CustomerRegistrationRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

public class UserBVATest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("BVA: Verify Password Min Length Boundary (7, 8, 9)")
    void testPasswordBoundary() {
        // Case boundary: 7 (Min-1) - Expected: FAIL
        CustomerRegistrationRequest req7 = new CustomerRegistrationRequest();
        req7.setEmail("test@gmail.com");
        req7.setName("Test");
        req7.setPassword("1234567");
        Set<ConstraintViolation<CustomerRegistrationRequest>> violations7 = validator.validate(req7);
        assertFalse(violations7.isEmpty(), "PASSWORD_MIN_FAIL: Nên có lỗi khi password = 7 ký tự (Min-1)");
        assertTrue(violations7.stream().anyMatch(v -> v.getMessage().contains("must be between 8 and 32 characters")));

        // Case boundary: 8 (Min) - Expected: PASS
        CustomerRegistrationRequest req8 = new CustomerRegistrationRequest();
        req8.setEmail("test@gmail.com");
        req8.setName("Test");
        req8.setPassword("12345678");
        Set<ConstraintViolation<CustomerRegistrationRequest>> violations8 = validator.validate(req8);
        // Only checking violations for password field
        long passwordViolations8 = violations8.stream()
                .filter(v -> v.getPropertyPath().toString().equals("password"))
                .count();
        assertEquals(0, passwordViolations8, "PASSWORD_MIN_PASS: Không nên có lỗi khi password = 8 ký tự (Min)");

        // Case boundary: 9 (Min+1) - Expected: PASS
        CustomerRegistrationRequest req9 = new CustomerRegistrationRequest();
        req9.setEmail("test@gmail.com");
        req9.setName("Test");
        req9.setPassword("123456789");
        Set<ConstraintViolation<CustomerRegistrationRequest>> violations9 = validator.validate(req9);
        long passwordViolations9 = violations9.stream()
                .filter(v -> v.getPropertyPath().toString().equals("password"))
                .count();
        assertEquals(0, passwordViolations9, "PASSWORD_MIN_PASS: Không nên có lỗi khi password = 9 ký tự (Min+1)");
    }
}
