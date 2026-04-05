package com.ev.user_service.repository;

import com.ev.user_service.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    @EntityGraph(attributePaths = {
            "roles",
            "dealerStaffProfile",
            "dealerManagerProfile",
            "evmStaffProfile",
            "adminProfile"
    })
    @Query("SELECT u FROM User u")
    List<User> findAllWithProfilesAndRoles();

    @EntityGraph(attributePaths = {
            "roles",
            "dealerStaffProfile",
            "dealerManagerProfile",
            "evmStaffProfile",
            "adminProfile"
    })
    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {
            "roles",
            "dealerStaffProfile",
            "dealerManagerProfile",
            "evmStaffProfile",
            "adminProfile"
    })
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN u.roles r " +
            "LEFT JOIN u.dealerStaffProfile dsp " +
            "LEFT JOIN u.dealerManagerProfile dmp " +
            "WHERE (:roleName IS NULL OR r.name = :roleName) " +
            "AND (:dealerId IS NULL OR dsp.dealerId = :dealerId OR dmp.dealerId = :dealerId) " +
            "AND (:searchText IS NULL OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
            "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
            "LOWER(u.name) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
            "u.phone LIKE CONCAT('%', :searchText, '%'))")
    Page<User> searchUsers(
            @Param("roleName") String roleName,
            @Param("searchText") String searchText,
            @Param("dealerId") UUID dealerId,
            Pageable pageable);

    Boolean existsByEmail(String email);

    Boolean existsByPhone(String phone);
}
