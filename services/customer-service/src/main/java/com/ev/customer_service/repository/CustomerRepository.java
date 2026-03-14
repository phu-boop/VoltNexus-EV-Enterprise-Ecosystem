package com.ev.customer_service.repository;

import com.ev.customer_service.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByPhone(String phone);

    Optional<Customer> findByProfileId(String profileId);

    Optional<Customer> findByIdNumber(String idNumber);

    List<Customer> findByStatus(String status);

    List<Customer> findByCustomerType(String customerType);

    List<Customer> findByPreferredDealerId(Long preferredDealerId);

    boolean existsByEmail(String email);

    boolean existsByIdNumber(String idNumber);

    boolean existsByPhone(String phone);

    @Query("SELECT c FROM Customer c WHERE LOWER(c.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.address) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Customer> searchCustomers(@Param("keyword") String keyword);
}
