package com.ev.user_service.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import com.ev.user_service.validation.annotation.PasswordConstraint;


@Data
public class ChangePasswordRequest {
    @NotBlank(message = "MISSING_REQUIRED_FIELD")
    @Email(message = "INVALID_EMAIL_FORMAT")
    private String email;
    @NotBlank(message = "MISSING_REQUIRED_FIELD")
    @PasswordConstraint(
            minLength = 8,
            hasUppercase = true,
            hasLowercase = true,
            hasNumber = true,
            hasSpecialChar = true,
            message = "PASSWORD_INVALID_FORMAT"
    )
    private String newPassword;
    private String oldPassword;
    
}
