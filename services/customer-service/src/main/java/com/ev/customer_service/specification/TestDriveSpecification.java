package com.ev.customer_service.specification;

import com.ev.customer_service.dto.request.TestDriveFilterRequest;
import com.ev.customer_service.entity.TestDriveAppointment;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Specification để filter động lịch hẹn lái thử
 */
public class TestDriveSpecification {
    private static final String FIELD_DEALER_ID = "dealerId";
    private static final String FIELD_CUSTOMER = "customer";
    private static final String FIELD_CUSTOMER_ID = "customerId";
    private static final String FIELD_MODEL_ID = "modelId";
    private static final String FIELD_VARIANT_ID = "variantId";
    private static final String FIELD_STAFF_ID = "staffId";
    private static final String FIELD_STATUS = "status";
    private static final String FIELD_APPOINTMENT_DATE = "appointmentDate";
    private static final String FIELD_FIRST_NAME = "firstName";
    private static final String FIELD_LAST_NAME = "lastName";
    private static final String FIELD_TEST_DRIVE_LOCATION = "testDriveLocation";

    private TestDriveSpecification() {
        // Utility class
    }

    public static Specification<TestDriveAppointment> filterBy(TestDriveFilterRequest filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            addDealerPredicate(predicates, root, criteriaBuilder, filter.getDealerId());
            addCustomerPredicate(predicates, root, criteriaBuilder, filter.getCustomerId());
            addVehiclePredicate(predicates, root, criteriaBuilder, filter.getModelId(), filter.getVariantId());
            addStaffPredicate(predicates, root, criteriaBuilder, filter.getStaffId());
            addStatusPredicate(predicates, root, criteriaBuilder, filter.getStatuses());
            addDatePredicate(predicates, root, criteriaBuilder, filter.getStartDate(), filter.getEndDate());
            addCustomerNamePredicate(predicates, root, criteriaBuilder, filter.getCustomerName());
            addLocationPredicate(predicates, root, criteriaBuilder, filter.getLocation());

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static void addDealerPredicate(List<Predicate> predicates, Root<TestDriveAppointment> root,
            CriteriaBuilder cb, String dealerId) {
        if (dealerId != null) {
            predicates.add(cb.equal(root.get(FIELD_DEALER_ID), dealerId));
        }
    }

    private static void addCustomerPredicate(List<Predicate> predicates, Root<TestDriveAppointment> root,
            CriteriaBuilder cb, Long customerId) {
        if (customerId != null) {
            predicates.add(cb.equal(root.get(FIELD_CUSTOMER).get(FIELD_CUSTOMER_ID), customerId));
        }
    }

    private static void addVehiclePredicate(List<Predicate> predicates, Root<TestDriveAppointment> root,
            CriteriaBuilder cb, Long modelId, Long variantId) {
        if (modelId != null) {
            predicates.add(cb.equal(root.get(FIELD_MODEL_ID), modelId));
        }
        if (variantId != null) {
            predicates.add(cb.equal(root.get(FIELD_VARIANT_ID), variantId));
        }
    }

    private static void addStaffPredicate(List<Predicate> predicates, Root<TestDriveAppointment> root,
            CriteriaBuilder cb, String staffId) {
        if (staffId != null) {
            predicates.add(cb.equal(root.get(FIELD_STAFF_ID), staffId));
        }
    }

    private static void addStatusPredicate(List<Predicate> predicates, Root<TestDriveAppointment> root,
            CriteriaBuilder cb, List<String> statuses) {
        if (statuses != null && !statuses.isEmpty()) {
            predicates.add(root.get(FIELD_STATUS).in(statuses));
        }
    }

    private static void addDatePredicate(List<Predicate> predicates, Root<TestDriveAppointment> root,
            CriteriaBuilder cb, java.time.LocalDateTime start, java.time.LocalDateTime end) {
        if (start != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get(FIELD_APPOINTMENT_DATE), start));
        }
        if (end != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get(FIELD_APPOINTMENT_DATE), end));
        }
    }

    private static void addCustomerNamePredicate(List<Predicate> predicates, Root<TestDriveAppointment> root,
            CriteriaBuilder cb, String name) {
        if (name != null && !name.isEmpty()) {
            String pattern = "%" + name.toLowerCase() + "%";
            Predicate first = cb.like(cb.lower(root.get(FIELD_CUSTOMER).get(FIELD_FIRST_NAME)), pattern);
            Predicate last = cb.like(cb.lower(root.get(FIELD_CUSTOMER).get(FIELD_LAST_NAME)), pattern);
            predicates.add(cb.or(first, last));
        }
    }

    private static void addLocationPredicate(List<Predicate> predicates, Root<TestDriveAppointment> root,
            CriteriaBuilder cb, String loc) {
        if (loc != null && !loc.isEmpty()) {
            predicates.add(cb.like(cb.lower(root.get(FIELD_TEST_DRIVE_LOCATION)), "%" + loc.toLowerCase() + "%"));
        }
    }
}
