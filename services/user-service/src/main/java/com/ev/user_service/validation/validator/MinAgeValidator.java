package com.ev.user_service.validation.validator;

import com.ev.user_service.validation.annotation.MinAge;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalDate;
import java.time.Period;

public class MinAgeValidator implements ConstraintValidator<MinAge, LocalDate> {

    private int minAge;

    @Override
    public void initialize(MinAge annotation) {
        this.minAge = annotation.value();
    }

    @Override
    public boolean isValid(LocalDate birthday, ConstraintValidatorContext context) {
        if (birthday == null) {
            return true;
        }

        int age = Period.between(birthday, LocalDate.now()).getYears();

        return age >= minAge;
    }
}
