package com.ev.customer_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.ev.customer_service.util.LenientLongDeserializer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Size(max = 50, message = "ID number must not exceed 50 characters")
    private String idNumber;

    // CustomerType: INDIVIDUAL hoặc CORPORATE (optional, mặc định = INDIVIDUAL)
    private String customerType;

    private LocalDate registrationDate;

    // CustomerStatus: NEW, POTENTIAL, PURCHASED, INACTIVE (optional, mặc định = NEW khi tạo)
    private String status;

    private Long preferredDealerId;

    // UUID của nhân viên được phân công (từ User Service)
    private String assignedStaffId;
    
    // UUID từ User Service (để link với user account)
    @Size(max = 36, message = "Profile ID must not exceed 36 characters")
    private String profileId;
}
