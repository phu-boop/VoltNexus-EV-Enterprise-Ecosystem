package com.ev.dealer_service.repository;

import com.ev.dealer_service.entity.DealerLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DealerLocationRepository extends JpaRepository<DealerLocation, Long> {

    List<DealerLocation> findByDealerDealerId(UUID dealerId);

    List<DealerLocation> findByCity(String city);

    List<DealerLocation> findByStatus(String status);

    List<DealerLocation> findByDealerDealerIdAndStatus(UUID dealerId, String status);
}
