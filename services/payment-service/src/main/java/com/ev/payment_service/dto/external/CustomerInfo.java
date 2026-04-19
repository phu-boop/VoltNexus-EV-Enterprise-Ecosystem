package com.ev.payment_service.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO để fetch customer info from customer_db
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerInfo {
    private Long customerId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;

    public String getFullName() {
        if (firstName == null && lastName == null) {
            return null;
        }
        return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
    }
}
