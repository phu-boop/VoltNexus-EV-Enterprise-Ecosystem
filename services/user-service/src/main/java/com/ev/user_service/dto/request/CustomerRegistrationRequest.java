package com.ev.user_service.dto.request;

import com.ev.user_service.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CustomerRegistrationRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Name is required")
    private String name;

    private String fullName;

    @Pattern(regexp = "^[0-9]{10,12}$", message = "Invalid phone format")
    private String phone;

    private String address;
    private String city;
    private String country;

    @Past(message = "Birthday must be in the past")
    private LocalDate birthday;

    private Gender gender;

    private UUID preferredDealerId; // Optional: đại lý ưa thích

    private String captchaToken; // For reCAPTCHA verification
}

