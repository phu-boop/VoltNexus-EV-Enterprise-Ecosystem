package com.ev.dealer_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DealerRequest {

    @NotBlank(message = "Dealer code is required")
    @Size(max = 50, message = "Dealer code must not exceed 50 characters")
    private String dealerCode;

    @NotBlank(message = "Dealer name is required")
    @Size(max = 200, message = "Dealer name must not exceed 200 characters")
    private String dealerName;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 100, message = "Region must not exceed 100 characters")
    private String region;

    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    private String email;

    @Size(max = 50, message = "Tax number must not exceed 50 characters")
    private String taxNumber;
}
