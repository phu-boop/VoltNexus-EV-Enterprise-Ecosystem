package com.ev.sales_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "outbox")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Outbox {

    @Id
    @Column(length = 36)
    private String id; // UUID string

    private String aggregateType;
    private String aggregateId;
    private String eventType;

    @Column(columnDefinition = "LONGTEXT")
    private String payload;

    private String status;
    private int attempts;

    private LocalDateTime lastAttemptAt;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
}
