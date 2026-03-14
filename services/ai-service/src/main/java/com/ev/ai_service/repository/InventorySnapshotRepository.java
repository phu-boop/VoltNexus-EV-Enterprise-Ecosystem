package com.ev.ai_service.repository;

import com.ev.ai_service.entity.InventorySnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventorySnapshotRepository extends JpaRepository<InventorySnapshot, Long> {
    
    List<InventorySnapshot> findByVariantIdAndSnapshotDateBetween(
        Long variantId, 
        LocalDateTime startDate, 
        LocalDateTime endDate
    );
    
    List<InventorySnapshot> findByDealerIdAndSnapshotDateBetween(
        UUID dealerId, 
        LocalDateTime startDate, 
        LocalDateTime endDate
    );
    
    Optional<InventorySnapshot> findTopByVariantIdOrderBySnapshotDateDesc(Long variantId);
    
    // Get all snapshots for a variant ordered by date desc
    List<InventorySnapshot> findByVariantIdOrderBySnapshotDateDesc(Long variantId);
    
    @Query("SELECT SUM(i.availableQuantity) FROM InventorySnapshot i " +
           "WHERE i.snapshotDate = (SELECT MAX(i2.snapshotDate) FROM InventorySnapshot i2)")
    Integer getCurrentTotalInventory();
    
    @Query("SELECT i.region, SUM(i.availableQuantity) FROM InventorySnapshot i " +
           "WHERE i.snapshotDate = (SELECT MAX(i2.snapshotDate) FROM InventorySnapshot i2 WHERE i2.region = i.region) " +
           "GROUP BY i.region")
    List<Object[]> getCurrentInventoryByRegion();
}
