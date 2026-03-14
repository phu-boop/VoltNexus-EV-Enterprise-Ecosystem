package com.ev.user_service.dto.request;

import com.ev.user_service.entity.*;
import com.ev.user_service.enums.Gender;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class UpdateProfileRequest {
    private UUID userId;
    private String name;
    private String fullName;
    private String phone;
    private String address;
    private LocalDate birthday;
    private String city;
    private String country;
    private Gender gender;
    private String url;
}
