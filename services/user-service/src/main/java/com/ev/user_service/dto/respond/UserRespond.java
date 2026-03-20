package com.ev.user_service.dto.respond;

import com.ev.user_service.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.ev.user_service.entity.Role;
import com.ev.user_service.enums.Gender;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRespond {
    UUID id;
    UUID memberId;
    String email;
    String name;
    String fullName;
    String phone;
    String address;
    String city;
    String country;
    LocalDate birthday;
    Gender gender;
    Set<Role> roles;
    LocalDateTime lastLogin;
    UserStatus status;
    String url;
    private UUID dealerId;
}
