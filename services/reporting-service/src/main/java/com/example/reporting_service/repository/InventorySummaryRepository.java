package com.example.reporting_service.repository;

import com.example.reporting_service.model.InventorySummaryByRegion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

// Kế thừa JpaSpecificationExecutor để có thể query động
public interface InventorySummaryRepository 
    extends JpaRepository<InventorySummaryByRegion, Long>, JpaSpecificationExecutor<InventorySummaryByRegion> {

    /**
     * HÀM MỚI BẠN CẦN THÊM VÀO
     * Phương thức UPSERT này CỘNG DỒN 'delta' (thay đổi) vào total_stock.
     * Đây là phương thức mà InventoryPersistenceService đang gọi.
     */
    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO inventory_summary_by_region (
            region, variant_id, model_id, model_name, variant_name, 
            total_stock, last_updated_at
        ) VALUES (
            :region, :variantId, :modelId, :modelName, :variantName, 
            :delta, CURRENT_TIMESTAMP
        )
        ON DUPLICATE KEY UPDATE
            total_stock = inventory_summary_by_region.total_stock + VALUES(total_stock),
            model_id = VALUES(model_id),
            model_name = VALUES(model_name),
            variant_name = VALUES(variant_name),
            last_updated_at = CURRENT_TIMESTAMP
    """, nativeQuery = true)
    void updateStockByDelta(
        String region, 
        Long variantId, 
        Long delta, // Đây là phần chênh lệch (VD: +5 hoặc -2)
        Long modelId, 
        String modelName, 
        String variantName
    );
}