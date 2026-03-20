package com.ev.user_service.validation.annotation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import com.ev.user_service.validation.validator.PasswordConstraintValidator;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = PasswordConstraintValidator.class)
@Target({ ElementType.FIELD, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
public @interface PasswordConstraint {
    String message() default "Invalid Password";
    int minLength() default 8;
    boolean hasUppercase() default true;
    boolean hasLowercase() default true;
    boolean hasNumber() default true;
    boolean hasSpecialChar() default true;
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
