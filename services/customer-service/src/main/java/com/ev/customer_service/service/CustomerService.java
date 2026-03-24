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
                .toList();
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
                .toList();
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        // Check uniqueness
        validateNewCustomerUniqueness(request);

        Customer customer = modelMapper.map(request, Customer.class);

        parseEnums(customer, request);

        // Auto-generate customer code: CUS-YYYYMMDD-XXXX
        customer.setCustomerCode(generateCustomerCode());

        Customer savedCustomer = customerRepository.save(customer);
        return modelMapper.map(savedCustomer, CustomerResponse.class);
    }

    private void validateNewCustomerUniqueness(CustomerRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Customer with email " + request.getEmail() + " already exists");
        }

        if (request.getPhone() != null && !request.getPhone().isEmpty() &&
                customerRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Customer with phone " + request.getPhone() + " already exists");
        }

        if (request.getIdNumber() != null && customerRepository.existsByIdNumber(request.getIdNumber())) {
            throw new DuplicateResourceException(
                    "Customer with ID number " + request.getIdNumber() + " already exists");
        }
    }

    private void parseEnums(Customer customer, CustomerRequest request) {
        if (request.getCustomerType() != null && !request.getCustomerType().isEmpty()) {
            try {
                customer.setCustomerType(CustomerType.valueOf(request.getCustomerType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                customer.setCustomerType(CustomerType.INDIVIDUAL); // Default
            }
        }

        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            try {
                customer.setStatus(CustomerStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                customer.setStatus(CustomerStatus.NEW); // Default
            }
        }
    }

    private String generateCustomerCode() {
        String datePrefix = java.time.LocalDate.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));

        long count = customerRepository.count();
        String sequence = String.format("%04d", (count % 10000) + 1);

        return "CUS-" + datePrefix + "-" + sequence;
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        validateExistingCustomerUniqueness(request, customer);

        // Capture old state for audit
        Customer oldState = copyCurrentState(customer);

        updateFields(customer, request);

        Customer updatedCustomer = customerRepository.save(customer);

        recordAuditTrail(oldState, updatedCustomer);

        return modelMapper.map(updatedCustomer, CustomerResponse.class);
    }

    private void validateExistingCustomerUniqueness(CustomerRequest request, Customer existingCustomer) {
        if (!existingCustomer.getEmail().equals(request.getEmail()) &&
                customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Customer with email " + request.getEmail() + " already exists");
        }

        if (request.getPhone() != null && !request.getPhone().isEmpty() &&
                !request.getPhone().equals(existingCustomer.getPhone()) &&
                customerRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Customer with phone " + request.getPhone() + " already exists");
        }

        if (request.getIdNumber() != null &&
                !request.getIdNumber().equals(existingCustomer.getIdNumber()) &&
                customerRepository.existsByIdNumber(request.getIdNumber())) {
            throw new DuplicateResourceException(
                    "Customer with ID number " + request.getIdNumber() + " already exists");
        }
    }

    private Customer copyCurrentState(Customer customer) {
        Customer copy = new Customer();
        copy.setFirstName(customer.getFirstName());
        copy.setLastName(customer.getLastName());
        copy.setEmail(customer.getEmail());
        copy.setPhone(customer.getPhone());
        copy.setAddress(customer.getAddress());
        copy.setIdNumber(customer.getIdNumber());
        copy.setCustomerType(customer.getCustomerType());
        copy.setStatus(customer.getStatus());
        return copy;
    }

    private void updateFields(Customer customer, CustomerRequest request) {
        customer.setFirstName(request.getFirstName());
        customer.setLastName(request.getLastName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setIdNumber(request.getIdNumber());
        customer.setRegistrationDate(request.getRegistrationDate());
        customer.setPreferredDealerId(request.getPreferredDealerId());
        customer.setAssignedStaffId(request.getAssignedStaffId());

        if (request.getCustomerType() != null && !request.getCustomerType().isEmpty()) {
            try {
                customer.setCustomerType(CustomerType.valueOf(request.getCustomerType().toUpperCase()));
            } catch (IllegalArgumentException ignored) {
            }
        }

        if (request.getStatus() != null && !request.getStatus().isEmpty()) {
            try {
                customer.setStatus(CustomerStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException ignored) {
            }
        }
    }

    private void recordAuditTrail(Customer oldState, Customer newState) {
        java.util.Map<String, Object> changes = new java.util.HashMap<>();

        addChangeIfDifferent(changes, "firstName", oldState.getFirstName(), newState.getFirstName());
        addChangeIfDifferent(changes, "lastName", oldState.getLastName(), newState.getLastName());
        addChangeIfDifferent(changes, "email", oldState.getEmail(), newState.getEmail());
        addChangeIfDifferent(changes, "phone", oldState.getPhone(), newState.getPhone());
        addChangeIfDifferent(changes, "address", oldState.getAddress(), newState.getAddress());
        addChangeIfDifferent(changes, "idNumber", oldState.getIdNumber(), newState.getIdNumber());

        if (oldState.getCustomerType() != newState.getCustomerType()) {
            changes.put("customerType", java.util.Map.of(
                    "old", String.valueOf(oldState.getCustomerType()),
                    "new", String.valueOf(newState.getCustomerType())));
        }

        if (oldState.getStatus() != newState.getStatus()) {
            changes.put("status", java.util.Map.of(
                    "old", String.valueOf(oldState.getStatus()),
                    "new", String.valueOf(newState.getStatus())));
        }

        if (!changes.isEmpty()) {
            com.ev.customer_service.entity.CustomerProfileAudit audit = new com.ev.customer_service.entity.CustomerProfileAudit();
            audit.setCustomerId(newState.getCustomerId());
            audit.setChangedBy(java.util.Optional
                    .ofNullable(com.ev.customer_service.util.RequestContext.getCurrentUser()).orElse("system"));
            try {
                audit.setChangesJson(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(changes));
            } catch (Exception ex) {
                audit.setChangesJson(changes.toString());
            }
            auditRepository.save(audit);
        }
    }

    private void addChangeIfDifferent(java.util.Map<String, Object> changes, String field, Object oldVal,
            Object newVal) {
        if (!java.util.Objects.equals(oldVal, newVal)) {
            changes.put(field, java.util.Map.of(
                    "old", oldVal != null ? oldVal.toString() : "null",
                    "new", newVal != null ? newVal.toString() : "null"));
        }
    }

    @Transactional
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Customer not found with id: " + id);
        }
        customerRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<AuditResponse> getCustomerAuditHistory(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        return auditRepository.findByCustomerIdOrderByChangedAtDesc(customerId).stream()
                .map(audit -> modelMapper.map(audit, AuditResponse.class))
                .toList();
    }
}
