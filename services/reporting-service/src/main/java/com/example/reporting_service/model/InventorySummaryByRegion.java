package com.example.reporting_service.model;

import jakarta.persistence.*;
import java.sql.Timestamp;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "inventory_summary_by_region",
       uniqueConstraints = @UniqueConstraint(
           name = "idx_inventory_logical_key", // Tên của Khóa duy nhất
           columnNames = {"region", "variantId"} // Các cột tạo nên khóa
       )
)
@Data // Tự động tạo getters, setters, toString, equals/hashCode 
@NoArgsConstructor
@AllArgsConstructor
public class InventorySummaryByRegion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long modelId;
    private String modelName;
    
    @Column(nullable = false)
    private Long variantId;
    private String variantName;
    
    @Column(nullable = false)
    private String region;
    
    private Long totalStock;
    
    
    @Column(name = "last_updated_at")
    private Timestamp lastUpdatedAt;
}