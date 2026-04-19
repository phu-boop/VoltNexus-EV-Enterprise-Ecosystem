package com.ev.inventory_service.repository;

import com.ev.inventory_service.model.CentralInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface CentralInventoryRepository
        extends JpaRepository<CentralInventory, Long>, JpaSpecificationExecutor<CentralInventory> {
    // Tìm kiếm tồn kho trong kho trung tâm bằng variantId
    Optional<CentralInventory> findByVariantId(Long variantId);

    /**
     * Tìm tất cả bản ghi tồn kho dựa trên danh sách các variantId.
     */
    List<CentralInventory> findByVariantIdIn(List<Long> variantIds);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(c.availableQuantity) FROM CentralInventory c")
    Long sumAvailableQuantity();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM CentralInventory c WHERE c.availableQuantity > 0 AND c.availableQuantity <= c.reorderLevel")
    long countLowStockVariants();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM CentralInventory c WHERE c.availableQuantity = 0")
    long countOutOfStockVariants();
}
