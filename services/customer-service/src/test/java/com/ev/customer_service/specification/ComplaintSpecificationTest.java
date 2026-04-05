package com.ev.customer_service.specification;

import com.ev.customer_service.entity.Complaint;
import com.ev.customer_service.enums.ComplaintSeverity;
import com.ev.customer_service.enums.ComplaintStatus;
import com.ev.customer_service.enums.ComplaintType;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Root;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ComplaintSpecificationTest {

    @Mock
    private Root<Complaint> root;

    @Mock
    private CriteriaQuery<?> query;

    @Mock
    private CriteriaBuilder cb;

    @Mock
    private Path<Object> path;

    @Mock
    private Path<LocalDateTime> localDateTimePath;

    @Test
    @DisplayName("hasDealerId Specification")
    void hasDealerId() {
        Specification<Complaint> spec = ComplaintSpecification.hasDealerId("D001");
        when(root.get("dealerId")).thenReturn(path);

        spec.toPredicate(root, query, cb);

        verify(cb).equal(path, "D001");
    }

    @Test
    @DisplayName("hasStatus Specification")
    void hasStatus() {
        Specification<Complaint> spec = ComplaintSpecification.hasStatus(ComplaintStatus.NEW);
        when(root.get("status")).thenReturn(path);

        spec.toPredicate(root, query, cb);

        verify(cb).equal(path, ComplaintStatus.NEW);
    }

    @Test
    @DisplayName("hasType Specification")
    void hasType() {
        Specification<Complaint> spec = ComplaintSpecification.hasType(ComplaintType.VEHICLE_QUALITY);
        when(root.get("complaintType")).thenReturn(path);

        spec.toPredicate(root, query, cb);

        verify(cb).equal(path, ComplaintType.VEHICLE_QUALITY);
    }

    @Test
    @DisplayName("hasSeverity Specification")
    void hasSeverity() {
        Specification<Complaint> spec = ComplaintSpecification.hasSeverity(ComplaintSeverity.HIGH);
        when(root.get("severity")).thenReturn(path);

        spec.toPredicate(root, query, cb);

        verify(cb).equal(path, ComplaintSeverity.HIGH);
    }

    @Test
    @DisplayName("hasAssignedStaff Specification")
    void hasAssignedStaff() {
        Specification<Complaint> spec = ComplaintSpecification.hasAssignedStaff("STAFF-1");
        when(root.get("assignedStaffId")).thenReturn(path);

        spec.toPredicate(root, query, cb);

        verify(cb).equal(path, "STAFF-1");
    }

    @Test
    @DisplayName("hasCustomerId Specification")
    void hasCustomerId() {
        Specification<Complaint> spec = ComplaintSpecification.hasCustomerId(1L);
        when(root.get("customer")).thenReturn(path);
        when(path.get("customerId")).thenReturn(path);

        spec.toPredicate(root, query, cb);

        verify(cb).equal(path, 1L);
    }

    @Test
    @DisplayName("createdBetween Specification")
    @SuppressWarnings("unchecked")
    void createdBetween() {
        LocalDateTime start = LocalDateTime.now().minusDays(1);
        LocalDateTime end = LocalDateTime.now();
        Specification<Complaint> spec = ComplaintSpecification.createdBetween(start, end);
        when(root.get("createdAt")).thenReturn((Path) localDateTimePath);

        spec.toPredicate(root, query, cb);

        verify(cb).between(any(), any(LocalDateTime.class), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("hasOrderId Specification")
    void hasOrderId() {
        Specification<Complaint> spec = ComplaintSpecification.hasOrderId(100L);
        when(root.get("orderId")).thenReturn(path);

        spec.toPredicate(root, query, cb);

        verify(cb).equal(path, 100L);
    }
}
