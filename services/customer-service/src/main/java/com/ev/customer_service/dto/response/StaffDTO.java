package com.ev.customer_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO để nhận thông tin nhân viên từ User Service
 * Map từ UserRespond của User Service
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffDTO {
    private String id; // UUID as string
    private String email;
    private String name;
    private String fullName;
    private String phone;
    private String address;
    private String status; // ACTIVE, INACTIVE, etc.
    
    // Helper method để check active
    public Boolean getActive() {
        return "ACTIVE".equalsIgnoreCase(status);
    }
}
