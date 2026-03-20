package com.ev.user_service.repository;

import com.ev.user_service.entity.EvmStaffProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EvmStaffProfileRepository extends JpaRepository<EvmStaffProfile, UUID> {
    Optional<EvmStaffProfile> findByUserId(UUID userID);
}
