package com.ev.vehicle_service.dto.request;

import com.ev.common_lib.model.enums.VehicleStatus;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class VariantRequestValidationBvaTest {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        validatorFactory.close();
    }

    @ParameterizedTest(name = "CreateVariantRequest price={0} -> violation={1}")
    @CsvSource({"-1, true", "0, false", "1, false"})
    void createVariantRequest_priceBoundary_shouldMatchExpected(String priceValue, boolean expectedViolation) {
        CreateVariantRequest request = validCreateVariantRequest();
        request.setPrice(new BigDecimal(priceValue));

        Set<ConstraintViolation<CreateVariantRequest>> violations = validator.validate(request);
        boolean hasPriceViolation = hasViolation(violations, "price");

        assertThat(hasPriceViolation).isEqualTo(expectedViolation);
    }

    @ParameterizedTest(name = "CreateVariantRequest wholesalePrice={0} -> violation={1}")
    @CsvSource({"-1, true", "0, false", "1, false"})
    void createVariantRequest_wholesalePriceBoundary_shouldMatchExpected(String wholesalePriceValue,
            boolean expectedViolation) {
        CreateVariantRequest request = validCreateVariantRequest();
        request.setWholesalePrice(new BigDecimal(wholesalePriceValue));

        Set<ConstraintViolation<CreateVariantRequest>> violations = validator.validate(request);
        boolean hasWholesalePriceViolation = hasViolation(violations, "wholesalePrice");

        assertThat(hasWholesalePriceViolation).isEqualTo(expectedViolation);
    }

    @ParameterizedTest(name = "UpdateVariantRequest price={0} -> violation={1}")
    @CsvSource({"-1, true", "0, false", "1, false"})
    void updateVariantRequest_priceBoundary_shouldMatchExpected(String priceValue, boolean expectedViolation) {
        UpdateVariantRequest request = validUpdateVariantRequest();
        request.setPrice(new BigDecimal(priceValue));

        Set<ConstraintViolation<UpdateVariantRequest>> violations = validator.validate(request);
        boolean hasPriceViolation = hasViolation(violations, "price");

        assertThat(hasPriceViolation).isEqualTo(expectedViolation);
    }

    @ParameterizedTest(name = "UpdateVariantRequest wholesalePrice={0} -> violation={1}")
    @CsvSource({"-1, true", "0, false", "1, false"})
    void updateVariantRequest_wholesalePriceBoundary_shouldMatchExpected(String wholesalePriceValue,
            boolean expectedViolation) {
        UpdateVariantRequest request = validUpdateVariantRequest();
        request.setWholesalePrice(new BigDecimal(wholesalePriceValue));

        Set<ConstraintViolation<UpdateVariantRequest>> violations = validator.validate(request);
        boolean hasWholesalePriceViolation = hasViolation(violations, "wholesalePrice");

        assertThat(hasWholesalePriceViolation).isEqualTo(expectedViolation);
    }

    private CreateVariantRequest validCreateVariantRequest() {
        CreateVariantRequest request = new CreateVariantRequest();
        request.setVersionName("Standard");
        request.setColor("Black");
        request.setSkuCode("SKU-001");
        request.setPrice(BigDecimal.ONE);
        request.setStatus(VehicleStatus.IN_PRODUCTION);
        return request;
    }

    private UpdateVariantRequest validUpdateVariantRequest() {
        UpdateVariantRequest request = new UpdateVariantRequest();
        request.setVersionName("Standard");
        request.setColor("Black");
        request.setPrice(BigDecimal.ONE);
        request.setStatus(VehicleStatus.IN_PRODUCTION);
        return request;
    }

    private <T> boolean hasViolation(Set<ConstraintViolation<T>> violations, String fieldName) {
        return violations.stream().anyMatch(v -> fieldName.equals(v.getPropertyPath().toString()));
    }
}
