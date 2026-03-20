package com.ev.user_service.repository;

import com.ev.user_service.entity.DealerManagerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DealerManagerProfileRepository extends JpaRepository<DealerManagerProfile, UUID> {
    Optional<DealerManagerProfile> findByUserId(UUID userID);
    boolean existsByDealerId(UUID dealerId);
}
