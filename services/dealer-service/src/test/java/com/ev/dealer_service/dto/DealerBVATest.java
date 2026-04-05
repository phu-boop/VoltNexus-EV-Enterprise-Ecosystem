package com.ev.dealer_service.dto;

import com.ev.dealer_service.dto.request.DealerRequest;
import com.ev.dealer_service.dto.request.DealerContractRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

public class DealerBVATest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("BVA: Verify Dealer Name Max Length Boundary (199, 200, 201)")
    void testDealerNameBoundary() {
        // Case Max-1: 199 characters - Expected: PASS
        DealerRequest req199 = new DealerRequest();
        req199.setDealerCode("D001");
        req199.setDealerName("a".repeat(199));
        Set<ConstraintViolation<DealerRequest>> violations199 = validator.validate(req199);
        assertTrue(violations199.stream().noneMatch(v -> v.getPropertyPath().toString().equals("dealerName")));

        // Case Max: 200 characters - Expected: PASS
        DealerRequest req200 = new DealerRequest();
        req200.setDealerCode("D001");
        req200.setDealerName("a".repeat(200));
        Set<ConstraintViolation<DealerRequest>> violations200 = validator.validate(req200);
        assertTrue(violations200.stream().noneMatch(v -> v.getPropertyPath().toString().equals("dealerName")));

        // Case Max+1: 201 characters - Expected: FAIL
        DealerRequest req201 = new DealerRequest();
        req201.setDealerCode("D001");
        req201.setDealerName("a".repeat(201));
        Set<ConstraintViolation<DealerRequest>> violations201 = validator.validate(req201);
        assertFalse(violations201.isEmpty(), "Nên có lỗi khi dealerName > 200 ký tự");
        assertTrue(violations201.stream().anyMatch(v -> v.getMessage().contains("exceed 200 characters")));
    }

    @Test
    @DisplayName("BVA: Verify Contract Status Max Length Boundary (19, 20, 21)")
    void testContractStatusBoundary() {
        DealerContractRequest contractReq = new DealerContractRequest();
        contractReq.setContractNumber("CONT-001");

        // Case Max-1: 19 characters - PASS
        contractReq.setContractStatus("a".repeat(19));
        Set<ConstraintViolation<DealerContractRequest>> violations19 = validator.validate(contractReq);
        assertTrue(violations19.stream().noneMatch(v -> v.getPropertyPath().toString().equals("contractStatus")));

        // Case Max: 20 characters - PASS
        contractReq.setContractStatus("a".repeat(20));
        Set<ConstraintViolation<DealerContractRequest>> violations20 = validator.validate(contractReq);
        assertTrue(violations20.stream().noneMatch(v -> v.getPropertyPath().toString().equals("contractStatus")));

        // Case Max+1: 21 characters - FAIL
        contractReq.setContractStatus("a".repeat(21));
        Set<ConstraintViolation<DealerContractRequest>> violations21 = validator.validate(contractReq);
        assertFalse(violations21.isEmpty(), "Nên có lỗi khi contractStatus > 20 ký tự");
    }
}
