package com.ev.dealer_service.repository;

import com.ev.common_lib.dto.dealer.DealerBasicDto;
import com.ev.dealer_service.entity.Dealer;
import com.ev.dealer_service.enums.DealerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DealerRepository extends JpaRepository<Dealer, UUID> {

    Optional<Dealer> findByDealerCode(String dealerCode);

    List<Dealer> findByStatus(DealerStatus status);

    List<Dealer> findByCity(String city);

    List<Dealer> findByRegion(String region);

    @Query("SELECT d FROM Dealer d WHERE d.status = 'ACTIVE'")
    List<Dealer> findAllActiveDealers();

    @Query("SELECT d FROM Dealer d WHERE d.city = :city AND d.status = 'ACTIVE'")
    List<Dealer> findActiveDealersByCity(@Param("city") String city);

    boolean existsByDealerCode(String dealerCode);

    @Query("SELECT d FROM Dealer d WHERE LOWER(d.dealerName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(d.city) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Dealer> searchDealers(@Param("keyword") String keyword);

    /**
     * Lấy danh sách rút gọn của tất cả các đại lý
     */
    @Query("SELECT new com.ev.common_lib.dto.dealer.DealerBasicDto(d.dealerId, d.dealerName, d.region) FROM Dealer d")
    List<DealerBasicDto> findAllBasicInfo();

    List<Dealer> findByRegionAndDealerName(String region, String dealerName);
}
