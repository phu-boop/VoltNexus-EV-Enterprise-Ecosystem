package com.ev.dealer_service.repository;

import com.ev.dealer_service.entity.DealerContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DealerContractRepository extends JpaRepository<DealerContract, Long> {

    Optional<DealerContract> findByContractNumber(String contractNumber);

    List<DealerContract> findByDealerDealerId(UUID dealerId);

    List<DealerContract> findByContractStatus(String contractStatus);

    @Query("SELECT dc FROM DealerContract dc WHERE dc.dealer.dealerId = :dealerId AND dc.contractStatus = 'ACTIVE'")
    List<DealerContract> findActiveContractsByDealerId(@Param("dealerId") UUID dealerId);

    @Query("SELECT dc FROM DealerContract dc WHERE dc.endDate < :currentDate AND dc.contractStatus = 'ACTIVE'")
    List<DealerContract> findExpiredContracts(@Param("currentDate") LocalDate currentDate);

    boolean existsByContractNumber(String contractNumber);
}
