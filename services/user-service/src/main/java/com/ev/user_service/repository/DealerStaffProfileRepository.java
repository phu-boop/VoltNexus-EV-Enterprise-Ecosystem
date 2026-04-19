package com.ev.user_service.repository;

import com.ev.user_service.entity.DealerStaffProfile;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DealerStaffProfileRepository extends JpaRepository<DealerStaffProfile, UUID> {
    Optional<DealerStaffProfile> findByUserId(UUID userID);

    List<DealerStaffProfile> findByDealerId(UUID dealerId);

    /**
     * Loads staff with {@link com.ev.user_service.entity.User} in one query (avoids LazyInitializationException
     * when {@code spring.jpa.open-in-view=false}).
     */
    @Query("SELECT DISTINCT d FROM DealerStaffProfile d LEFT JOIN FETCH d.user WHERE d.dealerId = :dealerId")
    List<DealerStaffProfile> findByDealerIdWithUser(@Param("dealerId") UUID dealerId);
}
