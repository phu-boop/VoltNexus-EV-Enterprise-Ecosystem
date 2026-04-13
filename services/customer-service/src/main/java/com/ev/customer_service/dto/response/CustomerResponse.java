package com.ev.customer_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {

    private Long customerId;
    private String customerCode;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private String idNumber;
    private String customerType;
    private LocalDate registrationDate;
    private String status;
    private UUID preferredDealerId;
    private String assignedStaffId; // UUID string
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
