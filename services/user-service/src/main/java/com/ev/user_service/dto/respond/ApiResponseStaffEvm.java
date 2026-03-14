package com.ev.user_service.dto.respond;

import com.ev.user_service.enums.Gender;
import com.ev.user_service.enums.UserStatus;

import java.time.LocalDate;
import java.util.UUID;

public class ApiResponseStaffEvm {
    private String email;
    private String name;
    private String fullName;
    private String phone;
    private String address;
    private LocalDate birthday;
    private String city;
    private String country;
    private Gender gender;
    private UserStatus status;
    private UUID evmStaffId;
    private String department;
    private String specialization;
}
