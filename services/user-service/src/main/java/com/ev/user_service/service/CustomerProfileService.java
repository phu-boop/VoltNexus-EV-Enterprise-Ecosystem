package com.ev.user_service.service;

import com.ev.user_service.entity.CustomerProfile;
import com.ev.user_service.entity.User;
import com.ev.user_service.repository.CustomerProfileRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.UUID;

@Service
public class CustomerProfileService {

    private final CustomerProfileRepository customerProfileRepository;

    public CustomerProfileService(CustomerProfileRepository customerProfileRepository) {
        this.customerProfileRepository = customerProfileRepository;
    }

    public CustomerProfile saveCustomerProfile(User user, UUID preferredDealerId) {
        // Generate customer code (format: CUST-YYYYMMDD-XXXX)
        String customerCode = generateCustomerCode();

        CustomerProfile customerProfile = CustomerProfile.builder()
                .user(user)
                .customerCode(customerCode)
                .preferredDealerId(preferredDealerId)
                .loyaltyPoints(0L)
                .membershipTier("BRONZE")
                .registrationDate(LocalDate.now())
                .isVerified(false)
                .build();

        return customerProfileRepository.save(customerProfile);
    }

    private String generateCustomerCode() {
        String datePrefix = LocalDate.now().toString().replace("-", "");
        String randomSuffix = String.format("%04d", (int) (Math.random() * 10000));
        return "CUST-" + datePrefix + "-" + randomSuffix;
    }
}
