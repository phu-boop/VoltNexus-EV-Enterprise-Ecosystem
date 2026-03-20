package com.ev.sales_service.entity;

import com.ev.sales_service.enums.QuotationStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "quotations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "quotation_id", columnDefinition = "BINARY(16)")
    private UUID quotationId;

    @Column(name = "dealer_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID dealerId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId; // Đã migrate từ UUID sang Long

    @Column(name = "model_id", nullable = false)
    private Long modelId;

    @Column(name = "variant_id", nullable = false)
    private Long variantId;

    @Column(name = "staff_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID staffId;

    @Column(name = "quotation_date")
    private LocalDateTime quotationDate;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    @Column(name = "base_price", precision = 15, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "discount_amount", precision = 15, scale = 2)
    private BigDecimal discountAmount;

    @Column(name = "final_price", precision = 15, scale = 2)
    private BigDecimal finalPrice;

    @Column(name = "terms_conditions", columnDefinition = "TEXT")
    private String termsConditions;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    private QuotationStatus status;

    @OneToOne(mappedBy = "quotation")
    @EqualsAndHashCode.Exclude
    private SalesOrder salesOrder;

    @ManyToMany
    @JoinTable(
        name = "quotation_promotions",
        joinColumns = @JoinColumn(name = "quotation_id"),
        inverseJoinColumns = @JoinColumn(name = "promotion_id")
    )
    @JsonIgnore
    @Builder.Default
    private Set<Promotion> promotions = new java.util.HashSet<>();
}

