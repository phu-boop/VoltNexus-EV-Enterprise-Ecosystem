package com.ev.sales_service.repository;

import com.ev.sales_service.entity.Quotation;
import com.ev.sales_service.enums.QuotationStatus;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, UUID>, JpaSpecificationExecutor<Quotation> {

    // Filter cơ bản
    List<Quotation> findByDealerId(UUID dealerId);
    List<Quotation> findByCustomerId(Long customerId);
    List<Quotation> findByStaffId(UUID staffId);
    List<Quotation> findByStatus(QuotationStatus status);
    List<Quotation> findByQuotationDateBetween(LocalDateTime start, LocalDateTime end);

    // Filter phức tạp
    @Query("SELECT q FROM Quotation q WHERE " +
           "(:dealerId IS NULL OR q.dealerId = :dealerId) AND " +
           "(:customerId IS NULL OR q.customerId = :customerId) AND " +
           "(:staffId IS NULL OR q.staffId = :staffId) AND " +
           "(:status IS NULL OR q.status = :status) AND " +
           "(:startDate IS NULL OR q.quotationDate >= :startDate) AND " +
           "(:endDate IS NULL OR q.quotationDate <= :endDate)")
    List<Quotation> findByFilters(@Param("dealerId") UUID dealerId,
                                 @Param("customerId") Long customerId,
                                 @Param("staffId") UUID staffId,
                                 @Param("status") QuotationStatus status,
                                 @Param("startDate") LocalDateTime startDate,
                                 @Param("endDate") LocalDateTime endDate);

    // Tìm quotation sắp hết hạn
    @Query("SELECT q FROM Quotation q WHERE q.status = 'SENT' AND q.validUntil BETWEEN :now AND :threshold")
    List<Quotation> findExpiringQuotations(@Param("now") LocalDateTime now,
                                         @Param("threshold") LocalDateTime threshold);

    // Kiểm tra quotation đã accepted chưa
    boolean existsByQuotationIdAndStatus(UUID quotationId, QuotationStatus status);

    Quotation save(Quotation quotation);


}