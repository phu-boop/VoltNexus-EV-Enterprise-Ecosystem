package com.ev.customer_service.specification;

import com.ev.customer_service.dto.request.TestDriveFilterRequest;
import com.ev.customer_service.entity.TestDriveAppointment;
import jakarta.persistence.criteria.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TestDriveSpecificationTest {

    @Mock
    private Root<TestDriveAppointment> root;

    @Mock
    private CriteriaQuery<?> query;

    @Mock
    private CriteriaBuilder cb;

    @Mock
    private Path<Object> path;

    @Mock
    private Predicate predicate;

    @BeforeEach
    void setUp() {
        lenient().when(root.get(anyString())).thenReturn(path);
        lenient().when(path.get(anyString())).thenReturn(path);
        lenient().when(cb.equal(any(), any())).thenReturn(predicate);
        lenient().when(cb.and(any())).thenReturn(predicate);
        lenient().when(cb.and(any(Predicate[].class))).thenReturn(predicate);
        lenient().when(cb.or(any(Predicate[].class))).thenReturn(predicate);
        lenient().when(cb.or(any(Predicate.class), any(Predicate.class))).thenReturn(predicate);
        lenient().when(cb.like(any(), anyString())).thenReturn(predicate);
        lenient().when(cb.greaterThanOrEqualTo(any(), any(LocalDateTime.class))).thenReturn(predicate);
        lenient().when(cb.lessThanOrEqualTo(any(), any(LocalDateTime.class))).thenReturn(predicate);

        @SuppressWarnings("unchecked")
        Expression<String> expression = mock(Expression.class);
        lenient().when(cb.lower(any())).thenReturn(expression);
    }

    @Test
    @DisplayName("Filter theo dealer và status")
    void filterBy_dealerAndStatus() {
        TestDriveFilterRequest filter = new TestDriveFilterRequest();
        filter.setDealerId("DEALER1");
        filter.setStatuses(List.of("SCHEDULED", "CONFIRMED"));

        CriteriaBuilder.In<Object> inClause = mock(CriteriaBuilder.In.class);
        when(path.in(anyList())).thenReturn(inClause);

        Specification<TestDriveAppointment> spec = TestDriveSpecification.filterBy(filter);
        spec.toPredicate(root, query, cb);

        verify(cb).equal(path, "DEALER1");
        verify(path).in(List.of("SCHEDULED", "CONFIRMED"));
        verify(cb).and(any(Predicate[].class));
    }

    @Test
    @DisplayName("Filter theo customer name (search)")
    void filterBy_customerName() {
        TestDriveFilterRequest filter = new TestDriveFilterRequest();
        filter.setCustomerName("John");

        when(root.get("customer")).thenReturn(path);

        Specification<TestDriveAppointment> spec = TestDriveSpecification.filterBy(filter);
        spec.toPredicate(root, query, cb);

        verify(cb).or(any(Predicate.class), any(Predicate.class));
        verify(cb, atLeastOnce()).like(any(), eq("%john%"));
    }

    @Test
    @DisplayName("Filter theo date range")
    void filterBy_dateRange() {
        TestDriveFilterRequest filter = new TestDriveFilterRequest();
        LocalDateTime now = LocalDateTime.now();
        filter.setStartDate(now.minusDays(7));
        filter.setEndDate(now);

        Specification<TestDriveAppointment> spec = TestDriveSpecification.filterBy(filter);
        spec.toPredicate(root, query, cb);

        verify(cb).greaterThanOrEqualTo(any(), eq(filter.getStartDate()));
        verify(cb).lessThanOrEqualTo(any(), eq(filter.getEndDate()));
    }
}
