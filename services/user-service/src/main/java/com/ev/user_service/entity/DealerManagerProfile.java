package com.ev.user_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "dealer_manager_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DealerManagerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "manager_id")
    private UUID managerId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @Column(name = "dealer_id", nullable = false)
    private UUID dealerId;

    @Column(name = "management_level", length = 50)
    private String managementLevel;

    @Column(name = "approval_limit", precision = 15, scale = 2)
    private BigDecimal approvalLimit;

    @Column(name = "department", length = 100)
    private String department;
}
