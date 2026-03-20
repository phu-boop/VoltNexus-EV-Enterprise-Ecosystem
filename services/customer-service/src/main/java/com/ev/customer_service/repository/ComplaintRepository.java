package com.ev.customer_service.repository;

import com.ev.customer_service.entity.Complaint;
import com.ev.customer_service.enums.ComplaintSeverity;
import com.ev.customer_service.enums.ComplaintStatus;
import com.ev.customer_service.enums.ComplaintType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long>, 
                                             JpaSpecificationExecutor<Complaint> {

    List<Complaint> findByCustomerCustomerId(Long customerId);

    List<Complaint> findByDealerId(Long dealerId);

    List<Complaint> findByStatus(ComplaintStatus status);

    List<Complaint> findBySeverity(ComplaintSeverity severity);

    List<Complaint> findByDealerIdAndStatus(Long dealerId, ComplaintStatus status);

    List<Complaint> findByAssignedStaffId(String assignedStaffId);

    Optional<Complaint> findByComplaintCode(String complaintCode);

    // Statistics queries
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.dealerId = :dealerId")
    Long countByDealerId(@Param("dealerId") Long dealerId);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.dealerId = :dealerId AND c.status = :status")
    Long countByDealerIdAndStatus(@Param("dealerId") Long dealerId, @Param("status") ComplaintStatus status);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.dealerId = :dealerId AND c.severity = :severity")
    Long countByDealerIdAndSeverity(@Param("dealerId") Long dealerId, @Param("severity") ComplaintSeverity severity);

    @Query("SELECT c.complaintType, COUNT(c) FROM Complaint c WHERE c.dealerId = :dealerId GROUP BY c.complaintType")
    List<Object[]> countByComplaintType(@Param("dealerId") Long dealerId);

    @Query("SELECT c.assignedStaffName, COUNT(c) FROM Complaint c WHERE c.dealerId = :dealerId AND c.assignedStaffName IS NOT NULL GROUP BY c.assignedStaffName")
    List<Object[]> countByAssignedStaff(@Param("dealerId") Long dealerId);

    // Statistics queries with date range
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.dealerId = :dealerId " +
           "AND c.createdAt BETWEEN :startDate AND :endDate")
    Long countByDealerIdAndDateRange(
        @Param("dealerId") Long dealerId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.dealerId = :dealerId " +
           "AND c.status = :status " +
           "AND c.createdAt BETWEEN :startDate AND :endDate")
    Long countByDealerIdAndStatusAndDateRange(
        @Param("dealerId") Long dealerId,
        @Param("status") ComplaintStatus status,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.dealerId = :dealerId " +
           "AND c.severity = :severity " +
           "AND c.createdAt BETWEEN :startDate AND :endDate")
    Long countByDealerIdAndSeverityAndDateRange(
        @Param("dealerId") Long dealerId,
        @Param("severity") ComplaintSeverity severity,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT c.complaintType, COUNT(c) FROM Complaint c " +
           "WHERE c.dealerId = :dealerId " +
           "AND c.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY c.complaintType")
    List<Object[]> countByComplaintTypeAndDateRange(
        @Param("dealerId") Long dealerId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT c.assignedStaffName, COUNT(c) FROM Complaint c " +
           "WHERE c.dealerId = :dealerId " +
           "AND c.assignedStaffName IS NOT NULL " +
           "AND c.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY c.assignedStaffName")
    List<Object[]> countByAssignedStaffAndDateRange(
        @Param("dealerId") Long dealerId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // Average resolution time (in hours)
    @Query("SELECT AVG(TIMESTAMPDIFF(HOUR, c.createdAt, c.resolvedDate)) FROM Complaint c WHERE c.dealerId = :dealerId AND c.status = :status")
    Double getAverageResolutionTime(@Param("dealerId") Long dealerId, @Param("status") ComplaintStatus status);

    // Average first response time
    @Query("SELECT AVG(TIMESTAMPDIFF(HOUR, c.createdAt, c.firstResponseAt)) FROM Complaint c WHERE c.dealerId = :dealerId AND c.firstResponseAt IS NOT NULL")
    Double getAverageFirstResponseTime(@Param("dealerId") Long dealerId);

    // Average times with date range
    @Query("SELECT AVG(TIMESTAMPDIFF(HOUR, c.createdAt, c.resolvedDate)) FROM Complaint c " +
           "WHERE c.dealerId = :dealerId " +
           "AND c.status = :status " +
           "AND c.createdAt BETWEEN :startDate AND :endDate")
    Double getAverageResolutionTimeWithDateRange(
        @Param("dealerId") Long dealerId,
        @Param("status") ComplaintStatus status,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT AVG(TIMESTAMPDIFF(HOUR, c.createdAt, c.firstResponseAt)) FROM Complaint c " +
           "WHERE c.dealerId = :dealerId " +
           "AND c.firstResponseAt IS NOT NULL " +
           "AND c.createdAt BETWEEN :startDate AND :endDate")
    Double getAverageFirstResponseTimeWithDateRange(
        @Param("dealerId") Long dealerId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // Find overdue complaints (Critical: >24h, High: >24h without response)
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.dealerId = :dealerId " +
           "AND c.severity = :severity " +
           "AND c.status IN ('NEW', 'IN_PROGRESS') " +
           "AND c.createdAt < :overdueTime")
    Long countOverdueComplaints(
        @Param("dealerId") Long dealerId,
        @Param("severity") ComplaintSeverity severity,
        @Param("overdueTime") LocalDateTime overdueTime
    );

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.dealerId = :dealerId " +
           "AND c.severity = :severity " +
           "AND c.status IN ('NEW', 'IN_PROGRESS') " +
           "AND c.createdAt < :overdueTime " +
           "AND c.createdAt BETWEEN :startDate AND :endDate")
    Long countOverdueComplaintsWithDateRange(
        @Param("dealerId") Long dealerId,
        @Param("severity") ComplaintSeverity severity,
        @Param("overdueTime") LocalDateTime overdueTime,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    // Find complaints in date range
    @Query("SELECT c FROM Complaint c WHERE c.dealerId = :dealerId " +
           "AND c.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY c.createdAt DESC")
    List<Complaint> findByDealerIdAndDateRange(
        @Param("dealerId") Long dealerId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
}
