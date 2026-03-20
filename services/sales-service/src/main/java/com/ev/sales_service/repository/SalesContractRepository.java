package com.ev.sales_service.repository;

import com.ev.sales_service.entity.SalesContract;
import com.ev.sales_service.enums.ContractStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalesContractRepository extends JpaRepository<SalesContract, UUID> {

    Optional<SalesContract> findBySalesOrder_OrderId(UUID orderId);

    List<SalesContract> findByContractStatus(ContractStatus status);

    @Query("SELECT sc FROM SalesContract sc WHERE sc.contractDate BETWEEN :startDate AND :endDate")
    List<SalesContract> findByContractDateBetween(@Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate);

    @Query("SELECT sc FROM SalesContract sc WHERE sc.signingDate IS NOT NULL AND sc.signingDate BETWEEN :startDate AND :endDate")
    List<SalesContract> findSignedContractsBetween(@Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);

    @Query("SELECT sc FROM SalesContract sc WHERE sc.contractStatus = :status AND sc.contractDate < :date")
    List<SalesContract> findByStatusAndContractDateBefore(@Param("status") ContractStatus status,
                                                          @Param("date") LocalDateTime date);

    Long countByContractStatus(ContractStatus status);

    @Query("SELECT sc FROM SalesContract sc WHERE sc.digitalSignature IS NOT NULL")
    List<SalesContract> findDigitallySignedContracts();

    boolean existsBySalesOrder_OrderId(UUID orderId);

    @Query("""
            SELECT sc 
            FROM SalesContract sc
            WHERE (:customerId IS NULL OR sc.salesOrder.customerId = :customerId)
              AND (:status IS NULL OR sc.contractStatus = :status)
            """)
    List<SalesContract> searchContracts(
            @Param("customerId") Long customerId,
            @Param("status") ContractStatus status);
}