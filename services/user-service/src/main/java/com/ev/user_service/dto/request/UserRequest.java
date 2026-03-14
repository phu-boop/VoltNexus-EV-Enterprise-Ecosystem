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
    @NotBlank(groups = {OnCreate.class, OnUpdate.class, OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    @Email(groups = {OnCreate.class, OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    private String email;

    @NotBlank(groups = {OnCreate.class, OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    @PasswordConstraint(
            minLength = 8, hasUppercase = true, hasLowercase = true,
            hasNumber = true, hasSpecialChar = true,
            message = "PASSWORD_INVALID_FORMAT"
    )
    private String password;

    @NotBlank(groups = {OnCreate.class, OnUpdate.class, OnCreateDealerManager.class, OnCreateDealerStaff.class, OnCreateEvmStaff.class})
    private String name;

    private String fullName;
    private String address;
    private String url;

    @Pattern(regexp = "^[0-9]{10,12}$", message = "PHONE_INVALID_FORMAT")
    private String phone;

    @MinAge(value = 18, message = "AGE_TOO_YOUNG")
    private LocalDate birthday;

    private String city;
    private String country;
    private Gender gender;
    // ---DEALER MANAGER && DEALER STAFF---

    @NotNull(groups = {OnCreateDealerStaff.class, OnCreateDealerManager.class})
    private UUID dealerId;
    // ----- COMMON -----
    @NotBlank(message = "DEPARTMENT_MUST_NOT_BE_BLANK")
    private String department;

    // ----- DEALER MANAGER -----
    @NotBlank(message = "MANAGEMENT_LEVEL_MUST_NOT_BE_BLANK")
    private String managementLevel;

    // Số tiền: chỉ cho phép số, tối đa 13 chữ số nguyên và 2 chữ số thập phân
    @NotNull(message = "APPROVAL_LIMIT_IS_REQUIRED")
    @Digits(integer = 13, fraction = 2, message = "APPROVAL_LIMIT_INVALID_FORMAT")
    private BigDecimal approvalLimit;

    // ----- DEALER STAFF -----
    @NotBlank(message = "POSITION_MUST_NOT_BE_BLANK")
    private String position;

    // Validate định dạng ngày yyyy-MM-dd
    @NotNull(message = "HIRE_DATE_IS_REQUIRED")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate hireDate;

    // Validate lương: số hợp lệ, tối đa 13 chữ số nguyên + 2 thập phân
    @NotNull(message = "SALARY_IS_REQUIRED")
    @Digits(integer = 13, fraction = 2, message = "SALARY_INVALID_FORMAT")
    private BigDecimal salary;

    // Validate % hoa hồng, tối đa 3 chữ số nguyên + 2 thập phân
    @NotNull(message = "COMMISSION_RATE_IS_REQUIRED")
    @Digits(integer = 3, fraction = 2, message = "COMMISSION_RATE_INVALID_FORMAT")
    private BigDecimal commissionRate;

    // ----- EVM STAFF -----
    @NotBlank(message = "SPECIALIZATION_MUST_NOT_BE_BLANK")
    private String specialization;
}