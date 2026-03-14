package com.example.reporting_service.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sales_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesRecord {
    @Id
    private UUID id;

    private UUID orderId;

    private BigDecimal totalAmount;

    private LocalDateTime orderDate;

    // Reporting fields
    private String dealerName;
    private Long variantId;
    private String modelName;
    private String region; // Logic to determine region (e.g. North/South/Central based on address or dealer)
    
    private LocalDateTime reportedAt;
    
    @PrePersist
    public void prePersist() {
        if (reportedAt == null) {
            reportedAt = LocalDateTime.now();
        }
    }
}
