package com.ev.customer_service.specification;

import com.ev.customer_service.entity.Complaint;
import com.ev.customer_service.enums.ComplaintSeverity;
import com.ev.customer_service.enums.ComplaintStatus;
import com.ev.customer_service.enums.ComplaintType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

/**
 * Specification cho filtering Complaint entities
 * Sử dụng JPA Criteria API để build dynamic queries
 */
public class ComplaintSpecification {

    public static Specification<Complaint> hasDealerId(Long dealerId) {
        return (root, query, cb) -> cb.equal(root.get("dealerId"), dealerId);
    }

    public static Specification<Complaint> hasStatus(ComplaintStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Complaint> hasType(ComplaintType type) {
        return (root, query, cb) -> cb.equal(root.get("complaintType"), type);
    }

    public static Specification<Complaint> hasSeverity(ComplaintSeverity severity) {
        return (root, query, cb) -> cb.equal(root.get("severity"), severity);
    }

    public static Specification<Complaint> hasAssignedStaff(String staffId) {
        return (root, query, cb) -> cb.equal(root.get("assignedStaffId"), staffId);
    }

    public static Specification<Complaint> hasCustomerId(Long customerId) {
        return (root, query, cb) -> cb.equal(root.get("customer").get("customerId"), customerId);
    }

    public static Specification<Complaint> createdBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, cb) -> cb.between(root.get("createdAt"), startDate, endDate);
    }

    public static Specification<Complaint> hasOrderId(Long orderId) {
        return (root, query, cb) -> cb.equal(root.get("orderId"), orderId);
    }
}
