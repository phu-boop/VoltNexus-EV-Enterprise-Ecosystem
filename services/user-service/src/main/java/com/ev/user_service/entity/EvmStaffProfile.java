package com.ev.user_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "evm_staff_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvmStaffProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "evm_staff_id")
    private UUID evmStaffId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "specialization", length = 100)
    private String specialization;
}