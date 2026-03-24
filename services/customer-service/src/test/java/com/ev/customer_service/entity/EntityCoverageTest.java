package com.ev.customer_service.entity;

import com.ev.customer_service.enums.CustomerStatus;
import com.ev.customer_service.enums.CustomerType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class EntityCoverageTest {

    @Test
    @DisplayName("Test Customer Entity - basic coverage")
    void testCustomerEntity() {
        Customer customer = new Customer();
        customer.setCustomerId(1L);
        customer.setFirstName("John");
        customer.setLastName("Doe");
        customer.setEmail("john@example.com");
        customer.setPhone("0123456789");
        customer.setProfileId("profile-001");
        customer.setIdNumber("ID001");
        customer.setCustomerType(CustomerType.INDIVIDUAL);
        customer.setStatus(CustomerStatus.NEW);
        customer.setCreatedAt(LocalDateTime.now());
        customer.setUpdatedAt(LocalDateTime.now());

        assertThat(customer.getCustomerId()).isEqualTo(1L);
        assertThat(customer.getFirstName()).isEqualTo("John");
        assertThat(customer.getLastName()).isEqualTo("Doe");
        assertThat(customer.getEmail()).isEqualTo("john@example.com");
        assertThat(customer.getPhone()).isEqualTo("0123456789");
        assertThat(customer.getProfileId()).isEqualTo("profile-001");
        assertThat(customer.getIdNumber()).isEqualTo("ID001");
        assertThat(customer.getCustomerType()).isEqualTo(CustomerType.INDIVIDUAL);
        assertThat(customer.getStatus()).isEqualTo(CustomerStatus.NEW);
        assertThat(customer.getCreatedAt()).isNotNull();
        assertThat(customer.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Test Complaint Entity - basic coverage")
    void testComplaintEntity() {
        Complaint complaint = new Complaint();
        complaint.setComplaintId(1L);
        complaint.setComplaintCode("Code");
        complaint.setDealerId("D1");
        complaint.setOrderId(100L);
        complaint.setResolution("Fixed");
        complaint.setInternalResolution("Internal Fixed");
        complaint.setCustomerMessage("Message");
        complaint.setResolvedDate(LocalDateTime.now());
        complaint.setAssignedStaffId("STAFF-1");
        complaint.setAssignedStaffName("Staff");

        assertThat(complaint.getComplaintId()).isEqualTo(1L);
        assertThat(complaint.getComplaintCode()).isEqualTo("Code");
        assertThat(complaint.getDealerId()).isEqualTo("D1");
        assertThat(complaint.getOrderId()).isEqualTo(100L);
        assertThat(complaint.getResolution()).isEqualTo("Fixed");
        assertThat(complaint.getInternalResolution()).isEqualTo("Internal Fixed");
        assertThat(complaint.getCustomerMessage()).isEqualTo("Message");
        assertThat(complaint.getResolvedDate()).isNotNull();
        assertThat(complaint.getAssignedStaffId()).isEqualTo("STAFF-1");
        assertThat(complaint.getAssignedStaffName()).isEqualTo("Staff");
    }

    @Test
    @DisplayName("Test CartItem Entity - basic coverage")
    void testCartItemEntity() {
        CartItem item = CartItem.builder()
                .cartItemId(1L)
                .variantId(10L)
                .quantity(2)
                .vehicleName("EV1")
                .vehicleColor("Red")
                .vehicleImageUrl("http://img")
                .build();

        assertThat(item.getCartItemId()).isEqualTo(1L);
        assertThat(item.getVariantId()).isEqualTo(10L);
        assertThat(item.getQuantity()).isEqualTo(2);
        assertThat(item.getVehicleName()).isEqualTo("EV1");
        assertThat(item.getVehicleColor()).isEqualTo("Red");
        assertThat(item.getVehicleImageUrl()).isEqualTo("http://img");
    }
}
