package com.ev.user_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "customer_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "customer_id")
    private UUID customerId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @Column(name = "customer_code", length = 50, unique = true)
    private String customerCode;

    @Column(name = "preferred_dealer_id")
    private UUID preferredDealerId; // Đại lý ưa thích (optional)

    @Column(name = "loyalty_points", precision = 10, scale = 2)
    private Long loyaltyPoints;

    @Column(name = "membership_tier", length = 50)
    private String membershipTier; // BRONZE, SILVER, GOLD, PLATINUM

    @Column(name = "registration_date")
    private LocalDate registrationDate;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "verification_date")
    private LocalDate verificationDate;
}
