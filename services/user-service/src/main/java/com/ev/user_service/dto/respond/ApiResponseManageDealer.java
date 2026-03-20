package com.ev.user_service.dto.respond;

import com.ev.user_service.enums.Gender;
import com.ev.user_service.enums.UserStatus;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class ApiResponseManageDealer {
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
    private UUID managerId;
    private UUID dealerId;
    private String managementLevel;
    private String department;
}
