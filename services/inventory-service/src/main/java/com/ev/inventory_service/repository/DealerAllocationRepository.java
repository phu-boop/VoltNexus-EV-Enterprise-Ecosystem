package com.ev.inventory_service.repository;

import com.ev.inventory_service.model.DealerAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DealerAllocationRepository extends JpaRepository<DealerAllocation, Long> {
    // Tìm kiếm phân bổ cho đại lý bằng variantId và dealerId
    Optional<DealerAllocation> findByVariantIdAndDealerId(Long variantId, UUID dealerId);

    // Tìm tất cả các phân bổ của một variant
    List<DealerAllocation> findByVariantId(Long variantId);

    // Tìm tất cả các phân bổ của một dealer
    List<DealerAllocation> findByDealerId(UUID dealerId);

    /**
     * Tìm phiên bảng xe ở kho đại lí
     */
    List<DealerAllocation> findByVariantIdInAndDealerId(List<Long> variantIds, UUID dealerId);
}
