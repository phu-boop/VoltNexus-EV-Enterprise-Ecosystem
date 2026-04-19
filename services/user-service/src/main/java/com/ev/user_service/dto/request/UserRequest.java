package com.ev.user_service.dto.request;

import com.ev.user_service.validation.group.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.Data;
import com.ev.user_service.enums.Gender;
import com.ev.user_service.validation.annotation.MinAge;
import com.ev.user_service.validation.annotation.PasswordConstraint;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class UserRequest {

    // ----- COMMON -----
    @NotBlank(groups = {OnCreate.class, OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    @Email(groups = {OnCreate.class, OnUpdate.class, OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    @Size(max = 255, message = "EMAIL_TOO_LONG", groups = {OnCreate.class, OnUpdate.class, OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    private String email;

    @NotBlank(groups = {OnCreate.class, OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    @Size(min = 8, max = 32, message = "PASSWORD_OUT_OF_RANGE_LIMIT", 
          groups = {OnCreate.class, OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    @PasswordConstraint(
            minLength = 8, hasUppercase = true, hasLowercase = true,
            hasNumber = true, hasSpecialChar = true,
            message = "PASSWORD_INVALID_FORMAT_OR_MIN_LIMIT",
            // BẮT BUỘC phải có groups ở đây để lúc Create nó check
            groups = {OnCreate.class, OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class}
    )
    private String password;

    @NotBlank(groups = {OnCreate.class, OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    // Thêm @Size để test Boundary Value (Bắt buộc)
    @Size(min = 2, max = 50, message = "NAME_OUT_OF_RANGE_LIMIT", 
          groups = {OnCreate.class, OnUpdate.class, OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    private String name;

    @Size(max = 100, message = "FULL_NAME_TOO_LONG")
    private String fullName;
    
    @Size(max = 255, message = "ADDRESS_TOO_LONG")
    private String address;
    
    @Size(max = 255, message = "URL_TOO_LONG")
    private String url;

    // Đã thêm groups để check Boundary của Phone
    @Pattern(regexp = "^[0-9]{10,12}$", message = "PHONE_INVALID_FORMAT_OR_LIMIT", 
             groups = {OnCreate.class, OnUpdate.class, OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    private String phone;

    @MinAge(value = 18, message = "AGE_TOO_YOUNG_LIMIT", 
            groups = {OnCreate.class, OnUpdate.class, OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    private LocalDate birthday;

    @Size(max = 100, message = "CITY_TOO_LONG")
    private String city;
    
    @Size(max = 100, message = "COUNTRY_TOO_LONG")
    private String country;
    
    private Gender gender;

    // ---DEALER MANAGER && DEALER STAFF---
    @NotNull(groups = {OnCreateDealerStaff.class, OnCreateDealerManager.class})
    private UUID dealerId;

    // ----- COMMON STAFF -----
    @NotBlank(message = "DEPARTMENT_MUST_NOT_BE_BLANK", 
              groups = {OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    @Size(max = 100, message = "DEPARTMENT_TOO_LONG", groups = {OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    private String department;

    // ----- DEALER MANAGER -----
    @NotBlank(message = "MANAGEMENT_LEVEL_MUST_NOT_BE_BLANK", groups = {OnCreateDealerManager.class})
    @Size(max = 100, message = "MANAGEMENT_LEVEL_TOO_LONG", groups = {OnCreateDealerManager.class})
    private String managementLevel;

    @NotNull(message = "APPROVAL_LIMIT_IS_REQUIRED", groups = {OnCreateDealerManager.class})
    @Digits(integer = 13, fraction = 2, message = "APPROVAL_LIMIT_INVALID_FORMAT", groups = {OnCreateDealerManager.class})
    @PositiveOrZero(message = "APPROVAL_LIMIT_MUST_BE_POSITIVE", groups = {OnCreateDealerManager.class})
    private BigDecimal approvalLimit;

    // ----- DEALER STAFF -----
    @NotBlank(message = "POSITION_MUST_NOT_BE_BLANK", groups = {OnCreateDealerStaff.class})
    @Size(max = 100, message = "POSITION_TOO_LONG", groups = {OnCreateDealerStaff.class})
    private String position;

    @NotNull(message = "HIRE_DATE_IS_REQUIRED", groups = {OnCreateDealerStaff.class})
    @PastOrPresent(message = "HIRE_DATE_CANNOT_BE_IN_FUTURE", groups = {OnCreateDealerStaff.class})
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate hireDate;

    @NotNull(message = "SALARY_IS_REQUIRED", groups = {OnCreateDealerStaff.class})
    @Digits(integer = 13, fraction = 2, message = "SALARY_INVALID_FORMAT_LIMIT", groups = {OnCreateDealerStaff.class})
    @PositiveOrZero(message = "SALARY_MUST_BE_POSITIVE", groups = {OnCreateDealerStaff.class})
    private BigDecimal salary;

    @NotNull(message = "COMMISSION_RATE_IS_REQUIRED", groups = {OnCreateDealerStaff.class})
    @Digits(integer = 3, fraction = 2, message = "COMMISSION_RATE_INVALID_FORMAT_LIMIT", groups = {OnCreateDealerStaff.class})
    @DecimalMin(value = "0.0", inclusive = true, message = "COMMISSION_RATE_MUST_NOT_BE_NEGATIVE", groups = {OnCreateDealerStaff.class})
    @DecimalMax(value = "100.0", inclusive = true, message = "COMMISSION_RATE_MUST_NOT_EXCEED_100", groups = {OnCreateDealerStaff.class})
    private BigDecimal commissionRate;

    // ----- EVM STAFF -----
    @NotBlank(message = "SPECIALIZATION_MUST_NOT_BE_BLANK", groups = {OnCreateEvmStaff.class})
    @Size(max = 100, message = "SPECIALIZATION_TOO_LONG", groups = {OnCreateEvmStaff.class})
    private String specialization;
}