package com.ev.customer_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer_profile_audits")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerProfileAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_id")
    private Long auditId;

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "changed_by", length = 200)
    private String changedBy;

    @Column(name = "changes_json", columnDefinition = "TEXT")
    private String changesJson;

    @CreationTimestamp
    @Column(name = "changed_at", updatable = false)
    private LocalDateTime changedAt;
}
