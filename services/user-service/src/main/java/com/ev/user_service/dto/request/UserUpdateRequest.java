package com.ev.user_service.dto.request;

import com.ev.user_service.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class UserUpdateRequest {

    // ----- COMMON -----
    @NotBlank(message = "EMAIL_REQUIRED")
    @Email(message = "EMAIL_INVALID")
    private String email;

    private String password; // Không bắt buộc khi update

    @NotBlank(message = "NAME_REQUIRED")
    private String name;

    private String fullName;
    private String address;
    private String url;

    @Pattern(regexp = "^[0-9]{10,12}$", message = "PHONE_INVALID_FORMAT")
    private String phone;

    private LocalDate birthday;

    private String city;
    private String country;
    private Gender gender;

    // --- DEALER MANAGER & DEALER STAFF ---
    private UUID dealerId;

    @NotBlank(message = "DEPARTMENT_REQUIRED")
    private String department;

    // ----- DEALER MANAGER -----
    private String managementLevel;
    private BigDecimal approvalLimit;

    // ----- DEALER STAFF -----
    private String position;
    private LocalDate hireDate;
    private BigDecimal salary;
    private BigDecimal commissionRate;

    // ----- EVM STAFF -----
    private String specialization;
}
