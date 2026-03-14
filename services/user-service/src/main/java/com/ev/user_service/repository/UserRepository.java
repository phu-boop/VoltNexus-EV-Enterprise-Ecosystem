package com.ev.user_service.repository;

import com.ev.user_service.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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

    Boolean existsByEmail(String email);
    Boolean existsByPhone(String phone);
}
