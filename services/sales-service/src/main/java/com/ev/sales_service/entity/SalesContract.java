package com.ev.sales_service.entity;

import com.ev.sales_service.enums.ContractStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sales_contracts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesContract {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "contract_id", columnDefinition = "BINARY(16)")
    private UUID contractId;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private SalesOrder salesOrder;

    @Column(name = "contract_date")
    private LocalDateTime contractDate;

    @Column(name = "contract_terms", columnDefinition = "TEXT")
    private String contractTerms;

    @Column(name = "signing_date")
    private LocalDateTime signingDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "contract_status", length = 50)
    private ContractStatus contractStatus;

    @Column(name = "digital_signature", columnDefinition = "TEXT")
    private String digitalSignature;

    @Column(name = "contract_file_url", length = 500)
    private String contractFileUrl;
}
