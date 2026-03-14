package com.ev.customer_service.specification;

import com.ev.customer_service.dto.request.TestDriveFilterRequest;
import com.ev.customer_service.entity.TestDriveAppointment;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Specification để filter động lịch hẹn lái thử
 */
public class TestDriveSpecification {

    public static Specification<TestDriveAppointment> filterBy(TestDriveFilterRequest filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.getDealerId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("dealerId"), filter.getDealerId()));
            }

            if (filter.getCustomerId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("customer").get("customerId"), filter.getCustomerId()));
            }

            if (filter.getModelId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("modelId"), filter.getModelId()));
            }

            if (filter.getVariantId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("variantId"), filter.getVariantId()));
            }

            if (filter.getStaffId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("staffId"), filter.getStaffId()));
            }

            if (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) {
                predicates.add(root.get("status").in(filter.getStatuses()));
            }

            if (filter.getStartDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("appointmentDate"), filter.getStartDate()));
            }

            if (filter.getEndDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("appointmentDate"), filter.getEndDate()));
            }

            if (filter.getCustomerName() != null && !filter.getCustomerName().isEmpty()) {
                String searchPattern = "%" + filter.getCustomerName().toLowerCase() + "%";
                Predicate firstNamePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("customer").get("firstName")), 
                    searchPattern
                );
                Predicate lastNamePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("customer").get("lastName")), 
                    searchPattern
                );
                predicates.add(criteriaBuilder.or(firstNamePredicate, lastNamePredicate));
            }

            if (filter.getLocation() != null && !filter.getLocation().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("testDriveLocation")),
                    "%" + filter.getLocation().toLowerCase() + "%"
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
