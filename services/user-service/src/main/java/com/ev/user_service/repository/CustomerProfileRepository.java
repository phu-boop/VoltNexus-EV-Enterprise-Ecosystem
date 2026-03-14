package com.ev.user_service.repository;

import com.ev.user_service.entity.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, UUID> {
    Optional<CustomerProfile> findByUserId(UUID userId);

    Optional<CustomerProfile> findByCustomerCode(String customerCode);
}
