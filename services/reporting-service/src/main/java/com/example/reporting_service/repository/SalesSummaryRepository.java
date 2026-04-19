package com.example.reporting_service.repository;

import com.example.reporting_service.model.SalesSummaryByDealership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID; 
public interface SalesSummaryRepository extends JpaRepository<SalesSummaryByDealership, Long>, JpaSpecificationExecutor<SalesSummaryByDealership> {

    /**
     * Câu lệnh này sẽ CỘNG DỒN doanh số và số lượng.
     */
    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO sales_summary_by_dealership (
            region, dealership_id, dealership_name, 
            model_id, model_name, variant_id, variant_name, 
            total_units_sold, total_revenue, last_sale_at
        ) VALUES (
            :region, :dealershipId, :dealershipName, 
            :modelId, :modelName, :variantId, :variantName, 
            :quantity, :revenue, :saleTime
        )
        ON DUPLICATE KEY UPDATE
            total_units_sold = sales_summary_by_dealership.total_units_sold + VALUES(total_units_sold),
            total_revenue = sales_summary_by_dealership.total_revenue + VALUES(total_revenue),
            last_sale_at = VALUES(last_sale_at),
            dealership_name = VALUES(dealership_name),
            model_name = VALUES(model_name),
            variant_name = VALUES(variant_name)
    """, nativeQuery = true)
    void upsertSalesSummary(String region, UUID dealershipId, String dealershipName,
                            Long modelId, String modelName, Long variantId, String variantName,
                            Long quantity, Double revenue, Timestamp saleTime); 

    // Dùng cho Feature 2 (Tốc độ tiêu thụ)
    List<SalesSummaryByDealership> findByLastSaleAtAfter(Timestamp afterTimestamp);
    
    // Bạn cũng cần hàm này để "lazy-load" cache
    // (Đổi kiểu dữ liệu của dealershipId nếu nó là UUID)
    Optional<SalesSummaryByDealership> findByRegionAndDealershipIdAndVariantId(
        String region, UUID dealershipId, Long variantId
    );
}