package com.ev.user_service.entity;

import com.ev.user_service.enums.UserStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import com.ev.user_service.enums.Gender;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    String email;
    String password;
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_role", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    @JsonIgnore
    Set<Role> roles;
    String name;
    String fullName;
    String phone;
    String address;
    LocalDate birthday;
    String city;
    String country;
    @Column(length = 2000)
    String url;
    @Enumerated(EnumType.STRING)
    Gender gender;
    @CreationTimestamp
    @Column(updatable = false)
    LocalDateTime createdAt;

    public String getRoleToString() {
        if (this.roles == null || this.roles.isEmpty()) {
            return "";
        }
        return this.roles.stream()
                .map(Role::getName)
                .collect(Collectors.joining());
    }

    @UpdateTimestamp
    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private UserStatus status;

    // Relationships
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private DealerStaffProfile dealerStaffProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private DealerManagerProfile dealerManagerProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private EvmStaffProfile evmStaffProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private AdminProfile adminProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CustomerProfile customerProfile;

    public UUID getProfileId() {
        if (evmStaffProfile != null) {
            return evmStaffProfile.getEvmStaffId();
        }
        if (dealerManagerProfile != null) {
            return dealerManagerProfile.getManagerId();
        }
        if (dealerStaffProfile != null) {
            return dealerStaffProfile.getStaffId();
        }
        if (adminProfile != null) {
            return adminProfile.getAdmin_id();
        }
        if (customerProfile != null) {
            return customerProfile.getCustomerId();
        }
        return null;
    }

}
