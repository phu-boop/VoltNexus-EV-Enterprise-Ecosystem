package com.ev.user_service.dto.request;

import com.ev.user_service.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AdminUpdateRequest {

    @NotBlank(message = "EMAIL_REQUIRED")
    @Email(message = "EMAIL_INVALID")
    private String email;

    private String password; // Không bắt buộc khi update

    @NotBlank(message = "NAME_REQUIRED")
    private String name;

    private String fullName;

    private String address;
    private String city;
    private String country;
    private String department; // Có thể để trống
    private String position;   // Có thể để trống

    @Pattern(regexp = "^[0-9]{10,12}$", message = "PHONE_INVALID_FORMAT")
    private String phone;

    private LocalDate birthday;
    private Gender gender;
    private String managementLevel;
    private String specialization;
}


