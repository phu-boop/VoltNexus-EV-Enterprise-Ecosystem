package com.ev.customer_service.service;

import com.ev.customer_service.dto.request.CustomerRequest;
import com.ev.customer_service.dto.response.AuditResponse;
import com.ev.customer_service.dto.response.CustomerResponse;
import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.enums.CustomerStatus;
import com.ev.customer_service.enums.CustomerType;
import com.ev.customer_service.exception.DuplicateResourceException;
import com.ev.customer_service.exception.ResourceNotFoundException;
import com.ev.customer_service.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final ModelMapper modelMapper;
    private final com.ev.customer_service.repository.CustomerProfileAuditRepository auditRepository;

    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(customer -> modelMapper.map(customer, CustomerResponse.class))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return modelMapper.map(customer, CustomerResponse.class);
    }
    
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerByProfileId(String profileId) {
        Customer customer = customerRepository.findByProfileId(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with profileId: " + profileId));
        return modelMapper.map(customer, CustomerResponse.class);
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> searchCustomers(String keyword) {
        return customerRepository.searchCustomers(keyword).stream()
                .map(customer -> modelMapper.map(customer, CustomerResponse.class))
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        // Check email duplication
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Customer with email " + request.getEmail() + " already exists");
        }

        // Check phone duplication
        if (request.getPhone() != null && !request.getPhone().isEmpty() && 
            customerRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Customer with phone " + request.getPhone() + " already exists");
        }

        // Check ID number duplication
        if (request.getIdNumber() != null && customerRepository.existsByIdNumber(request.getIdNumber())) {
            throw new DuplicateResourceException("Customer with ID number " + request.getIdNumber() + " already exists");
        }

        Customer customer = modelMapper.map(request, Customer.class);
        
        // Parse and set CustomerType (if provided)
        if (request.getCustomerType() != null && !request.getCustomerType().isEmpty()) {
            try {
                customer.setCustomerType(CustomerType.valueOf(request.getCustomerType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                customer.setCustomerType(CustomerType.INDIVIDUAL); // Default
            }
        }
        
        // Parse and set CustomerStatus (if provided, otherwise @PrePersist will set to NEW)
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            try {
                customer.setStatus(CustomerStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                customer.setStatus(CustomerStatus.NEW); // Default
            }
        }
        
        // Auto-generate customer code: CUS-YYYYMMDD-XXXX
        customer.setCustomerCode(generateCustomerCode());
        
        Customer savedCustomer = customerRepository.save(customer);
        return modelMapper.map(savedCustomer, CustomerResponse.class);
    }

    /**
     * Generate unique customer code with format: CUS-YYYYMMDD-XXXX
     */
    private String generateCustomerCode() {
        String datePrefix = java.time.LocalDate.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        
        // Find the last customer created today
        long count = customerRepository.count();
        String sequence = String.format("%04d", (count % 10000) + 1);
        
        return "CUS-" + datePrefix + "-" + sequence;
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        // Check email duplication
        if (!customer.getEmail().equals(request.getEmail()) &&
            customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Customer with email " + request.getEmail() + " already exists");
        }

        // Check phone duplication
        if (request.getPhone() != null && !request.getPhone().isEmpty() &&
            !request.getPhone().equals(customer.getPhone()) &&
            customerRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Customer with phone " + request.getPhone() + " already exists");
        }

        // Check ID number duplication
        if (request.getIdNumber() != null &&
            !request.getIdNumber().equals(customer.getIdNumber()) &&
            customerRepository.existsByIdNumber(request.getIdNumber())) {
            throw new DuplicateResourceException("Customer with ID number " + request.getIdNumber() + " already exists");
        }

    // Capture old values for audit
    String oldFirstName = customer.getFirstName();
    String oldLastName = customer.getLastName();
    String oldEmail = customer.getEmail();
    String oldPhone = customer.getPhone();
    String oldAddress = customer.getAddress();
    String oldIdNumber = customer.getIdNumber();
    CustomerType oldCustomerType = customer.getCustomerType();
    CustomerStatus oldStatus = customer.getStatus();

    // Manually update fields to avoid overwriting relationships and managed fields
        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setIdNumber(request.getIdNumber());
        
        // Parse and set CustomerType
        if (request.getCustomerType() != null && !request.getCustomerType().isEmpty()) {
            try {
                customer.setCustomerType(CustomerType.valueOf(request.getCustomerType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Keep existing value if invalid
            }
        }
        
        customer.setRegistrationDate(request.getRegistrationDate());
        
        // Parse and set CustomerStatus
        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            try {
                customer.setStatus(CustomerStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Keep existing value if invalid
            }
        }
        
        customer.setPreferredDealerId(request.getPreferredDealerId());
        customer.setAssignedStaffId(request.getAssignedStaffId());
        // Don't update customerCode, customerId, createdAt, updatedAt, or relationships
        
        Customer updatedCustomer = customerRepository.save(customer);

        // Record audit if relevant fields changed
        java.util.Map<String, Object> changes = new java.util.HashMap<>();
        
        // Compare first name
        String newFirstName = updatedCustomer.getFirstName();
        if (!java.util.Objects.equals(oldFirstName, newFirstName)) {
            changes.put("firstName", java.util.Map.of(
                "old", oldFirstName != null ? oldFirstName : "null", 
                "new", newFirstName != null ? newFirstName : "null"
            ));
        }
        
        // Compare last name
        String newLastName = updatedCustomer.getLastName();
        if (!java.util.Objects.equals(oldLastName, newLastName)) {
            changes.put("lastName", java.util.Map.of(
                "old", oldLastName != null ? oldLastName : "null", 
                "new", newLastName != null ? newLastName : "null"
            ));
        }
        
        // Compare email
        String newEmail = updatedCustomer.getEmail();
        if (!java.util.Objects.equals(oldEmail, newEmail)) {
            changes.put("email", java.util.Map.of(
                "old", oldEmail != null ? oldEmail : "null", 
                "new", newEmail != null ? newEmail : "null"
            ));
        }
        
        // Compare phone
        String newPhone = updatedCustomer.getPhone();
        if (!java.util.Objects.equals(oldPhone, newPhone)) {
            changes.put("phone", java.util.Map.of(
                "old", oldPhone != null ? oldPhone : "null", 
                "new", newPhone != null ? newPhone : "null"
            ));
        }
        
        // Compare address
        String newAddress = updatedCustomer.getAddress();
        if (!java.util.Objects.equals(oldAddress, newAddress)) {
            changes.put("address", java.util.Map.of(
                "old", oldAddress != null ? oldAddress : "null", 
                "new", newAddress != null ? newAddress : "null"
            ));
        }
        
        // Compare ID number (CMND/CCCD)
        String newIdNumber = updatedCustomer.getIdNumber();
        if (!java.util.Objects.equals(oldIdNumber, newIdNumber)) {
            changes.put("idNumber", java.util.Map.of(
                "old", oldIdNumber != null ? oldIdNumber : "null", 
                "new", newIdNumber != null ? newIdNumber : "null"
            ));
        }
        
        // Compare customer type enum
        CustomerType newCustomerType = updatedCustomer.getCustomerType();
        if (oldCustomerType != newCustomerType) {
            changes.put("customerType", java.util.Map.of(
                "old", oldCustomerType != null ? oldCustomerType.name() : "null", 
                "new", newCustomerType != null ? newCustomerType.name() : "null"
            ));
        }
        
        // Compare status enum
        CustomerStatus newStatus = updatedCustomer.getStatus();
        if (oldStatus != newStatus) {
            changes.put("status", java.util.Map.of(
                "old", oldStatus != null ? oldStatus.name() : "null", 
                "new", newStatus != null ? newStatus.name() : "null"
            ));
        }

        if (!changes.isEmpty()) {
            com.ev.customer_service.entity.CustomerProfileAudit audit = new com.ev.customer_service.entity.CustomerProfileAudit();
            audit.setCustomerId(updatedCustomer.getCustomerId());
            // modifiedBy will be set by controller via header and passed through ThreadLocal or param; default to 'system' here
            audit.setChangedBy(java.util.Optional.ofNullable(com.ev.customer_service.util.RequestContext.getCurrentUser()).orElse("system"));
            try {
                String json = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(changes);
                audit.setChangesJson(json);
            } catch (Exception ex) {
                audit.setChangesJson(changes.toString());
            }
            auditRepository.save(audit);
        }
        return modelMapper.map(updatedCustomer, CustomerResponse.class);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer not found with id: " + id);
        }
        customerRepository.deleteById(id);
    }

    /**
     * Get audit history for a customer
     */
    @Transactional(readOnly = true)
    public List<AuditResponse> getCustomerAuditHistory(Long customerId) {
        // Verify customer exists
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }
        
        return auditRepository.findByCustomerIdOrderByChangedAtDesc(customerId).stream()
                .map(audit -> modelMapper.map(audit, AuditResponse.class))
                .collect(Collectors.toList());
    }
}
 