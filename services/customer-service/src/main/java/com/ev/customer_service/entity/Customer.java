package com.ev.customer_service.entity;

import com.ev.customer_service.enums.CustomerStatus;
import com.ev.customer_service.enums.CustomerType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "customer_code", unique = true, length = 20)
    private String customerCode; // Auto-generated: CUS-YYYYMMDD-XXXX

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "email", unique = true, length = 100)
    private String email;

    @Column(name = "profile_id", unique = true, length = 36)
    private String profileId; // UUID from User Service (links to user account)

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "id_number", unique = true, length = 50)
    private String idNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type", length = 20)
    private CustomerType customerType; // INDIVIDUAL, CORPORATE

    @Column(name = "registration_date")
    private LocalDate registrationDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private CustomerStatus status; // NEW, POTENTIAL, PURCHASED, INACTIVE

    @Column(name = "preferred_dealer_id")
    private Long preferredDealerId;

    @Column(name = "assigned_staff_id", length = 36)
    private String assignedStaffId; // UUID của nhân viên được phân công (từ User Service)

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TestDriveAppointment> testDriveAppointments;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Complaint> complaints;

    /**
     * Set default values before persisting
     */
    @PrePersist
    protected void onCreate() {
        if (this.status == null) {
            this.status = CustomerStatus.NEW; // Mặc định là khách hàng mới
        }
        if (this.registrationDate == null) {
            this.registrationDate = LocalDate.now();
        }
        if (this.customerType == null) {
            this.customerType = CustomerType.INDIVIDUAL; // Mặc định là cá nhân
        }
    }
}
