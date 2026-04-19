package com.ev.user_service.validation.validator;

import com.ev.user_service.validation.annotation.PasswordConstraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordConstraintValidator implements ConstraintValidator<PasswordConstraint, String> {

    private int minLength;
    private boolean hasUppercase;
    private boolean hasLowercase;
    private boolean hasNumber;
    private boolean hasSpecialChar;

    @Override
    public void initialize(PasswordConstraint annotation) {
        this.minLength = annotation.minLength();
        this.hasUppercase = annotation.hasUppercase();
        this.hasLowercase = annotation.hasLowercase();
        this.hasNumber = annotation.hasNumber();
        this.hasSpecialChar = annotation.hasSpecialChar();
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null)
            return false;
        if (password.length() < minLength)
            return false;
        if (hasUppercase && !java.util.regex.Pattern.compile("[A-Z]").matcher(password).find())
            return false;
        if (hasLowercase && !java.util.regex.Pattern.compile("[a-z]").matcher(password).find())
            return false;
        if (hasNumber && !java.util.regex.Pattern.compile("\\d").matcher(password).find())
            return false;
        if (hasSpecialChar && !java.util.regex.Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]")
                .matcher(password).find())
            return false;
        return true;
    }
}
