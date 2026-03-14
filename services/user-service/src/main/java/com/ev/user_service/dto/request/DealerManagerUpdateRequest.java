package com.ev.user_service.dto.request;

import com.ev.user_service.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class DealerManagerUpdateRequest {

    @NotBlank(message = "EMAIL_REQUIRED")
    @Email(message = "EMAIL_INVALID")
    private String email;

    private String password; // Không bắt buộc khi update

    @NotBlank(message = "NAME_REQUIRED")
    private String name;

    private String fullName;

    @NotNull(message = "DEALER_ID_REQUIRED")
    private UUID dealerId;

    @NotBlank(message = "DEPARTMENT_REQUIRED")
    private String department;

    @NotBlank(message = "MANAGEMENT_LEVEL_REQUIRED")
    private String managementLevel;

    @NotNull(message = "APPROVAL_LIMIT_REQUIRED")
    private BigDecimal approvalLimit;

    private String address;
    private String city;
    private String country;

    @Pattern(regexp = "^[0-9]{10,12}$", message = "PHONE_INVALID_FORMAT")
    private String phone;

    private LocalDate birthday;
    private Gender gender;
}
