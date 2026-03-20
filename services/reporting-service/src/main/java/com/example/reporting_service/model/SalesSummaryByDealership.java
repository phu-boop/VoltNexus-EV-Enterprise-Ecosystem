package com.example.reporting_service.model;

import jakarta.persistence.*;
import java.sql.Timestamp;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "sales_summary_by_dealership",
       uniqueConstraints = @UniqueConstraint(
           name = "idx_sales_logical_key", // Tên của Khóa duy nhất
           columnNames = {"region", "dealershipId", "variantId"} // Các cột tạo nên khóa
       )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesSummaryByDealership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Khóa chính logic (dùng để UPSERT)
    @Column(nullable = false)
    private String region;
    
    @Column(nullable = false)
    private UUID dealershipId;
    private String dealershipName;
    
    @Column(nullable = false)
    private Long modelId;
    private String modelName;

    @Column(nullable = false)
    private Long variantId;
    private String variantName;

    // Dữ liệu tổng hợp (Aggregated data)
    private Long totalUnitsSold; // Tổng số xe bán được
    private Double totalRevenue; // Tổng doanh thu
    
    @Column(name = "last_sale_at")
    private Timestamp lastSaleAt;
    
    // Bạn có thể thêm các cột thời gian (ngày, tháng, năm) nếu muốn báo cáo theo thời gian
    // private LocalDate saleDate;
}
