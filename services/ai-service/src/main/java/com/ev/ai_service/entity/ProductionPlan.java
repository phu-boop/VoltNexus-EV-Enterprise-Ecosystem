package com.ev.ai_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entity lưu trữ kế hoạch sản xuất và phân phối được đề xuất
 */
@Entity
@Table(name = "production_plan")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionPlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long variantId;
    
    @Column(nullable = false)
    private LocalDate planMonth; // Tháng kế hoạch
    
    @Column(nullable = false)
    private Integer recommendedProduction; // Số lượng đề xuất sản xuất
    
    @Column(nullable = false)
    private Integer predictedDemand; // Tổng nhu cầu dự báo
    
    @Column
    private Integer currentInventory; // Tồn kho hiện tại
    
    @Column
    private Integer productionGap; // Chênh lệch cần sản xuất
    
    @Column(length = 50)
    private String priority; // HIGH, MEDIUM, LOW
    
    @Column(length = 500)
    private String recommendations; // Gợi ý chi tiết
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime updatedAt; // Thời điểm cập nhật
    
    @Column
    private LocalDateTime approvedAt;
    
    @Column(length = 50)
    private String status; // DRAFT, APPROVED, EXECUTED
    
    // Metadata
    @Column(length = 100)
    private String modelName;
    
    @Column(length = 100)
    private String variantName;
}
