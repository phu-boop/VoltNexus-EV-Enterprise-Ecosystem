package com.ev.inventory_service.repository;

import com.ev.inventory_service.model.StockAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface StockAlertRepository extends JpaRepository<StockAlert, Long> {
    // Tìm các cảnh báo chưa được xử lý cho một sản phẩm cụ thể
    List<StockAlert> findByVariantIdAndStatus(Long variantId, String status);

    List<StockAlert> findAllByStatus(String status);

    List<StockAlert> findByVariantIdAndDealerIdAndStatus(Long variantId, UUID dealerId, String status);

    /**
     * Tìm CẢNH BÁO ĐẦU TIÊN (bất kỳ) có trạng thái "NEW" (đang hoạt động).
     */
    Optional<StockAlert> findFirstByVariantIdAndStatus(Long variantId, String status);
}
