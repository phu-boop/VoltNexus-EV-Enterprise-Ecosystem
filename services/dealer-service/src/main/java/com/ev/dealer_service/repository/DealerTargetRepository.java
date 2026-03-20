package com.ev.dealer_service.repository;

import com.ev.dealer_service.entity.DealerTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DealerTargetRepository extends JpaRepository<DealerTarget, Long> {

    List<DealerTarget> findByDealerDealerId(UUID dealerId);

    Optional<DealerTarget> findByDealerDealerIdAndTargetPeriod(UUID dealerId, String targetPeriod);

    List<DealerTarget> findByTargetPeriod(String targetPeriod);
}
