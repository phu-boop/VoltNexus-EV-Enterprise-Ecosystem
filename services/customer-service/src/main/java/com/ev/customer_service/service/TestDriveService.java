package com.ev.customer_service.service;

import com.ev.customer_service.dto.request.CancelTestDriveRequest;
import com.ev.customer_service.dto.request.TestDriveFilterRequest;
import com.ev.customer_service.dto.request.TestDriveRequest;
import com.ev.customer_service.dto.request.TestDriveFeedbackRequest;
import com.ev.customer_service.dto.request.UpdateTestDriveRequest;
import com.ev.customer_service.dto.request.PublicTestDriveRequest;
import com.ev.customer_service.enums.CustomerStatus;
import com.ev.customer_service.enums.CustomerType;
import com.ev.customer_service.dto.response.TestDriveCalendarResponse;
import com.ev.customer_service.dto.response.TestDriveResponse;
import com.ev.customer_service.dto.response.TestDriveStatisticsResponse;
import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.entity.TestDriveAppointment;
import com.ev.customer_service.exception.ResourceNotFoundException;
import com.ev.customer_service.repository.CustomerRepository;
import com.ev.customer_service.repository.TestDriveAppointmentRepository;
import com.ev.customer_service.specification.TestDriveSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestDriveService {

    private final TestDriveAppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final TestDriveNotificationService notificationService;
    private final EmailConfirmationService emailConfirmationService;
    private final ModelMapper modelMapper;

    private static final String APPOINTMENT_NOT_FOUND_PREFIX = "Appointment not found with id: ";
    private static final String STATUS_SCHEDULED = "SCHEDULED";
    private static final String STATUS_CONFIRMED = "CONFIRMED";
    private static final String STATUS_COMPLETED = "COMPLETED";
    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final String STATUS_EXPIRED = "EXPIRED";
    private static final String DATE_TIME_FORMAT_STD = "dd/MM/yyyy HH:mm";

    @Transactional(readOnly = true)
    public List<TestDriveResponse> getAppointmentsByDealerId(String dealerId) {
        return appointmentRepository.findByDealerId(dealerId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TestDriveResponse> getAppointmentsByCustomerId(Long customerId) {
        return appointmentRepository.findByCustomerCustomerId(customerId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TestDriveResponse> getAppointmentsByProfileId(String profileId) {
        log.info("Getting appointments for profileId: {}", profileId);

        // Find customer by profileId first
        Optional<Customer> customerOpt = customerRepository.findByProfileId(profileId);

        if (!customerOpt.isPresent()) {
            // Customer not found - this is OK for new users who just registered
            log.info("No customer found with profileId: {}. User has not booked test drives yet.", profileId);
            return new ArrayList<>();
        }

        Customer customer = customerOpt.get();
        log.info("Found customer ID: {} for profileId: {}", customer.getCustomerId(), profileId);

        List<TestDriveAppointment> appointments = appointmentRepository
                .findByCustomerCustomerId(customer.getCustomerId());
        log.info("Found {} appointments for customer ID: {}", appointments.size(), customer.getCustomerId());

        return appointments.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TestDriveResponse getAppointmentById(Long id) {
        TestDriveAppointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(APPOINTMENT_NOT_FOUND_PREFIX + id));
        return mapToResponse(appointment);
    }

    @Transactional
    public TestDriveResponse createAppointment(TestDriveRequest request) {
        // 1. Validate customer exists
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        // 2. Kiểm tra trùng lịch
        validateNoConflicts(request.getStaffId(), request.getModelId(), request.getVariantId(),
                request.getAppointmentDate(), request.getDurationMinutes(), null);

        // 3. Tạo appointment
        TestDriveAppointment appointment = modelMapper.map(request, TestDriveAppointment.class);
        appointment.setCustomer(customer);
        appointment.setStatus(STATUS_SCHEDULED);
        appointment.setNotificationSent(false);
        appointment.setReminderSent(false);
        appointment.setIsConfirmed(false); // Chưa xác nhận

        if (appointment.getDurationMinutes() == null) {
            appointment.setDurationMinutes(60); // Default 60 phút
        }

        // Lưu tên xe và nhân viên từ request (frontend đã resolve)
        appointment.setVehicleModelName(request.getVehicleModelName());
        appointment.setVehicleVariantName(request.getVehicleVariantName());
        appointment.setStaffName(request.getStaffName());

        // Generate confirmation token
        String token = java.util.UUID.randomUUID().toString();
        appointment.setConfirmationToken(token);
        appointment.setConfirmationSentAt(LocalDateTime.now());
        appointment.setConfirmationExpiresAt(LocalDateTime.now().plusDays(3)); // Hết hạn sau 3 ngày

        TestDriveAppointment savedAppointment = appointmentRepository.save(appointment);

        // 4. Gửi email xác nhận với link - lấy tên xe/nhân viên từ DB
        try {
            String customerName = customer.getFirstName() + " " + customer.getLastName();

            log.info("� Sending email - Vehicle: {} - {}, Staff: {}",
                    savedAppointment.getVehicleModelName(),
                    savedAppointment.getVehicleVariantName(),
                    savedAppointment.getStaffName());

            emailConfirmationService.sendConfirmationEmail(
                    savedAppointment,
                    customer.getEmail(),
                    customerName,
                    savedAppointment.getVehicleModelName(),
                    savedAppointment.getVehicleVariantName(),
                    savedAppointment.getStaffName());
            savedAppointment.setNotificationSent(true);
            appointmentRepository.save(savedAppointment);
            log.info("✅ Sent confirmation email for appointment ID: {}", savedAppointment.getAppointmentId());
        } catch (Exception e) {
            log.error("❌ Failed to send confirmation email", e);
            // Không throw exception để vẫn tạo được appointment
        }

        // 5. Gửi thông báo cho nhân viên (nếu có)
        if (savedAppointment.getStaffId() != null) {
            try {
                // TODO: Lấy thông tin staff từ User Service
            } catch (Exception e) {
                log.error("Failed to send staff notification", e);
            }
        }

        return mapToResponse(savedAppointment);
    }

    /**
     * Create test drive appointment from public request (no authentication
     * required)
     * Finds or creates customer based on phone/email
     */
    @Transactional
    public TestDriveResponse createPublicAppointment(PublicTestDriveRequest request) {
        // 1. Find or create customer
        Customer customer = findOrCreateCustomer(
                request.getCustomerName(),
                request.getCustomerPhone(),
                request.getCustomerEmail(),
                request.getProfileId());

        // 2. Validate no conflicts
        validateNoConflicts(null, request.getModelId(), request.getVariantId(),
                request.getAppointmentDate(), request.getDurationMinutes(), null);

        // 3. Create and save appointment
        TestDriveAppointment appointment = initPublicAppointment(request, customer);
        TestDriveAppointment savedAppointment = appointmentRepository.save(appointment);

        // 4. Send confirmation email
        sendPublicConfirmation(savedAppointment, customer, request.getCustomerEmail());

        return mapToResponse(savedAppointment);
    }

    private TestDriveAppointment initPublicAppointment(PublicTestDriveRequest request, Customer customer) {
        TestDriveAppointment appointment = new TestDriveAppointment();
        appointment.setCustomer(customer);
        appointment.setDealerId(request.getDealerId());
        appointment.setModelId(request.getModelId());
        appointment.setVariantId(request.getVariantId());
        appointment.setVehicleModelName(request.getVehicleModelName());
        appointment.setVehicleVariantName(request.getVehicleVariantName());
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setDurationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 60);
        appointment.setTestDriveLocation(request.getTestDriveLocation());
        appointment.setCustomerNotes(request.getCustomerNotes());
        appointment.setStatus(STATUS_SCHEDULED);
        appointment.setNotificationSent(false);
        appointment.setReminderSent(false);
        appointment.setIsConfirmed(false);

        // Generate confirmation token
        appointment.setConfirmationToken(java.util.UUID.randomUUID().toString());
        appointment.setConfirmationSentAt(LocalDateTime.now());
        appointment.setConfirmationExpiresAt(LocalDateTime.now().plusDays(3));

        return appointment;
    }

    private void sendPublicConfirmation(TestDriveAppointment appointment, Customer customer, String fallbackEmail) {
        try {
            String customerName = customer.getFirstName() + " " + customer.getLastName();
            String email = customer.getEmail() != null ? customer.getEmail() : fallbackEmail;

            if (email != null && !email.isEmpty()) {
                emailConfirmationService.sendConfirmationEmail(
                        appointment,
                        email,
                        customerName,
                        appointment.getVehicleModelName(),
                        appointment.getVehicleVariantName(),
                        null);
                appointment.setNotificationSent(true);
                appointmentRepository.save(appointment);
                log.info("✅ Sent confirmation email for public appointment ID: {}", appointment.getAppointmentId());
            }
        } catch (Exception e) {
            log.error("❌ Failed to send confirmation email for public appointment", e);
        }
    }

    /**
     * Find existing customer by phone, email, or profileId; or create new one
     */
    private Customer findOrCreateCustomer(String name, String phone, String email, String profileId) {
        // 1. Try to find by profileId
        Optional<Customer> customerOpt = findCustomerByProfileId(profileId, phone, email);
        if (customerOpt.isPresent())
            return customerOpt.get();

        // 2. Try to find by phone
        customerOpt = findCustomerByPhone(phone, email, profileId);
        if (customerOpt.isPresent())
            return customerOpt.get();

        // 3. Try to find by email
        customerOpt = findCustomerByEmail(email, phone, profileId);
        if (customerOpt.isPresent())
            return customerOpt.get();

        // 4. Create new customer
        return createNewCustomer(name, phone, email, profileId);
    }

    private Optional<Customer> findCustomerByProfileId(String profileId, String phone, String email) {
        if (profileId == null || profileId.isEmpty())
            return Optional.empty();

        Optional<Customer> existing = customerRepository.findByProfileId(profileId);
        if (existing.isPresent()) {
            Customer customer = existing.get();
            if (updateCustomerInfo(customer, phone, email, null)) {
                customerRepository.save(customer);
            }
            return Optional.ofNullable(customer);
        }
        return Optional.empty();
    }

    private Optional<Customer> findCustomerByPhone(String phone, String email, String profileId) {
        if (phone == null || phone.isEmpty())
            return Optional.empty();

        Optional<Customer> existing = customerRepository.findByPhone(phone);
        if (existing.isPresent()) {
            Customer customer = existing.get();
            if (updateCustomerInfo(customer, null, email, profileId)) {
                customerRepository.save(customer);
            }
            return Optional.ofNullable(customer);
        }
        return Optional.empty();
    }

    private Optional<Customer> findCustomerByEmail(String email, String phone, String profileId) {
        if (email == null || email.isEmpty())
            return Optional.empty();

        Optional<Customer> existing = customerRepository.findByEmail(email);
        if (existing.isPresent()) {
            Customer customer = existing.get();
            if (updateCustomerInfo(customer, phone, null, profileId)) {
                customerRepository.save(customer);
            }
            return Optional.ofNullable(customer);
        }
        return Optional.empty();
    }

    private boolean updateCustomerInfo(Customer customer, String phone, String email, String profileId) {
        boolean updated = false;
        if (phone != null && !phone.isEmpty() && !phone.equals(customer.getPhone())) {
            customer.setPhone(phone);
            updated = true;
        }
        if (email != null && !email.isEmpty() && (customer.getEmail() == null || !email.equals(customer.getEmail()))) {
            if (!customerRepository.existsByEmail(email)) {
                customer.setEmail(email);
                updated = true;
            }
        }
        if (profileId != null && !profileId.isEmpty() && customer.getProfileId() == null) {
            customer.setProfileId(profileId);
            updated = true;
        }
        return updated;
    }

    private Customer createNewCustomer(String name, String phone, String email, String profileId) {
        Customer newCustomer = new Customer();
        String[] nameParts = name != null ? name.trim().split("\\s+", 2) : new String[] { "", "" };
        newCustomer.setFirstName(nameParts.length > 0 ? nameParts[0] : "");
        newCustomer.setLastName(nameParts.length > 1 ? nameParts[1] : "");
        newCustomer.setPhone(phone);
        newCustomer.setEmail(email);
        newCustomer.setProfileId(profileId);
        newCustomer.setCustomerType(CustomerType.INDIVIDUAL);
        newCustomer.setStatus(CustomerStatus.NEW);

        String datePrefix = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        String sequence = String.format("%04d", (customerRepository.count() % 10000) + 1);
        newCustomer.setCustomerCode("CUS-" + datePrefix + "-" + sequence);

        return customerRepository.save(newCustomer);
    }

    @Transactional
    public TestDriveResponse updateAppointment(Long id, UpdateTestDriveRequest request) {
        TestDriveAppointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(APPOINTMENT_NOT_FOUND_PREFIX + id));

        // 1. Validate status and conflicts
        validateStatusForUpdate(appointment);
        validateConflictsForUpdate(appointment, request);

        // 2. Apply updates
        applyUpdateFields(appointment, request);
        TestDriveAppointment updatedAppointment = appointmentRepository.save(appointment);

        // 3. Send update notification
        sendUpdateNotification(updatedAppointment);

        return mapToResponse(updatedAppointment);
    }

    private void validateStatusForUpdate(TestDriveAppointment appointment) {
        if (STATUS_CANCELLED.equals(appointment.getStatus()) || STATUS_COMPLETED.equals(appointment.getStatus())) {
            throw new IllegalStateException("Cannot update cancelled or completed appointment");
        }
    }

    private void validateConflictsForUpdate(TestDriveAppointment appointment, UpdateTestDriveRequest request) {
        if (request.getAppointmentDate() != null || request.getStaffId() != null ||
                request.getModelId() != null || request.getVariantId() != null) {

            LocalDateTime newDate = request.getAppointmentDate() != null ? request.getAppointmentDate()
                    : appointment.getAppointmentDate();
            Integer newDuration = request.getDurationMinutes() != null ? request.getDurationMinutes()
                    : appointment.getDurationMinutes();
            String newStaffId = request.getStaffId() != null ? request.getStaffId() : appointment.getStaffId();
            Long newModelId = request.getModelId() != null ? request.getModelId() : appointment.getModelId();
            Long newVariantId = request.getVariantId() != null ? request.getVariantId() : appointment.getVariantId();

            validateNoConflicts(newStaffId, newModelId, newVariantId, newDate, newDuration,
                    appointment.getAppointmentId());
        }
    }

    private void applyUpdateFields(TestDriveAppointment appointment, UpdateTestDriveRequest request) {
        if (request.getAppointmentDate() != null)
            appointment.setAppointmentDate(request.getAppointmentDate());
        if (request.getAppointmentTime() != null)
            appointment.setAppointmentTime(request.getAppointmentTime());
        if (request.getDurationMinutes() != null)
            appointment.setDurationMinutes(request.getDurationMinutes());
        if (request.getModelId() != null)
            appointment.setModelId(request.getModelId());
        if (request.getVariantId() != null)
            appointment.setVariantId(request.getVariantId());
        if (request.getStaffId() != null)
            appointment.setStaffId(request.getStaffId());
        if (request.getTestDriveLocation() != null)
            appointment.setTestDriveLocation(request.getTestDriveLocation());
        if (request.getStaffNotes() != null)
            appointment.setStaffNotes(request.getStaffNotes());
        if (request.getUpdatedBy() != null)
            appointment.setUpdatedBy(request.getUpdatedBy());
    }

    private void sendUpdateNotification(TestDriveAppointment appointment) {
        try {
            Customer customer = appointment.getCustomer();
            notificationService.sendAppointmentUpdate(
                    appointment,
                    customer.getEmail(),
                    customer.getPhone(),
                    customer.getFirstName() + " " + customer.getLastName());
        } catch (Exception e) {
            log.error("Failed to send update notification", e);
        }
    }

    @Transactional
    public void cancelAppointment(Long id, CancelTestDriveRequest request) {
        TestDriveAppointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(APPOINTMENT_NOT_FOUND_PREFIX + id));

        if (STATUS_CANCELLED.equals(appointment.getStatus())) {
            throw new IllegalStateException("Appointment is already cancelled");
        }

        appointment.setStatus(STATUS_CANCELLED);
        appointment.setCancellationReason(request.getCancellationReason());
        appointment.setCancelledBy(request.getCancelledBy());
        appointment.setCancelledAt(LocalDateTime.now());

        appointmentRepository.save(appointment);

        // Gửi thông báo hủy
        try {
            Customer customer = appointment.getCustomer();
            notificationService.sendAppointmentCancellation(
                    appointment,
                    customer.getEmail(),
                    customer.getPhone(),
                    customer.getFirstName() + " " + customer.getLastName());
        } catch (Exception e) {
            log.error("Failed to send cancellation notification", e);
        }
    }

    @Transactional
    public void confirmAppointment(Long id) {
        TestDriveAppointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(APPOINTMENT_NOT_FOUND_PREFIX + id));

        appointment.setStatus(STATUS_CONFIRMED);
        appointment.setConfirmedAt(LocalDateTime.now());
        appointment.setIsConfirmed(true);
        appointmentRepository.save(appointment);
    }

    /**
     * Xác nhận lịch hẹn bằng token (từ link email)
     */
    @Transactional
    public void confirmAppointmentByToken(Long id, String token) {
        TestDriveAppointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(APPOINTMENT_NOT_FOUND_PREFIX + id));

        // Validate token
        if (appointment.getConfirmationToken() == null ||
                !appointment.getConfirmationToken().equals(token)) {
            throw new IllegalArgumentException("Invalid confirmation token");
        }

        // Kiểm tra đã hết hạn chưa
        if (appointment.getConfirmationExpiresAt() != null &&
                appointment.getConfirmationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Confirmation link has expired");
        }

        // Kiểm tra đã hủy hoặc hoàn thành chưa
        if (STATUS_CANCELLED.equals(appointment.getStatus()) ||
                STATUS_EXPIRED.equals(appointment.getStatus()) ||
                STATUS_COMPLETED.equals(appointment.getStatus())) {
            throw new IllegalStateException(
                    "Cannot confirm a " + appointment.getStatus().toLowerCase() + " appointment");
        }

        // Xác nhận
        appointment.setStatus(STATUS_CONFIRMED);
        appointment.setConfirmedAt(LocalDateTime.now());
        appointment.setIsConfirmed(true);
        appointmentRepository.save(appointment);

        log.info("✅ Appointment ID: {} confirmed by customer via email link", id);
    }

    /**
     * Hủy lịch hẹn bằng token (từ link email)
     */
    @Transactional
    public void cancelAppointmentByToken(Long id, String token) {
        TestDriveAppointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(APPOINTMENT_NOT_FOUND_PREFIX + id));

        // Validate token
        if (appointment.getConfirmationToken() == null ||
                !appointment.getConfirmationToken().equals(token)) {
            throw new IllegalArgumentException("Invalid confirmation token");
        }

        // Kiểm tra đã hủy hoặc hoàn thành chưa
        // Kiểm tra đã hủy hoặc hoàn thành chưa
        if (STATUS_CANCELLED.equals(appointment.getStatus()) ||
                STATUS_EXPIRED.equals(appointment.getStatus()) ||
                STATUS_COMPLETED.equals(appointment.getStatus())) {
            throw new IllegalStateException("Appointment is already " + appointment.getStatus().toLowerCase());
        }

        // Hủy
        appointment.setStatus(STATUS_CANCELLED);
        appointment.setCancellationReason("Khách hàng hủy qua link email");
        appointment.setCancelledBy("CUSTOMER");
        appointment.setCancelledAt(LocalDateTime.now());
        appointmentRepository.save(appointment);

        log.info("✅ Appointment ID: {} cancelled by customer via email link", id);

        // Gửi thông báo hủy
        try {
            Customer customer = appointment.getCustomer();
            notificationService.sendAppointmentCancellation(
                    appointment,
                    customer.getEmail(),
                    customer.getPhone(),
                    customer.getFirstName() + " " + customer.getLastName());
        } catch (Exception e) {
            log.error("Failed to send cancellation notification", e);
        }
    }

    @Transactional
    public void completeAppointment(Long id) {
        TestDriveAppointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(APPOINTMENT_NOT_FOUND_PREFIX + id));

        appointment.setStatus(STATUS_COMPLETED);
        appointment.setCompletedAt(LocalDateTime.now());
        appointmentRepository.save(appointment);
    }

    @Transactional(readOnly = true)
    public List<TestDriveResponse> filterAppointments(TestDriveFilterRequest filter) {
        Specification<TestDriveAppointment> spec = TestDriveSpecification.filterBy(filter);
        return appointmentRepository.findAll(spec).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TestDriveCalendarResponse> getCalendarView(String dealerId, LocalDateTime startDate,
            LocalDateTime endDate) {
        List<TestDriveAppointment> appointments;

        if (dealerId == null || dealerId.isEmpty()) {
            // Admin viewing all dealers' appointments
            appointments = appointmentRepository.findByDateRange(startDate, endDate);
        } else {
            // Dealer staff/manager viewing their dealer's appointments
            appointments = appointmentRepository.findByDealerIdAndDateRange(dealerId, startDate, endDate);
        }

        return appointments.stream()
                .map(this::mapToCalendarResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TestDriveStatisticsResponse getStatistics(String dealerId, LocalDateTime startDate, LocalDateTime endDate) {
        List<TestDriveAppointment> appointments;

        if (dealerId == null || dealerId.isEmpty()) {
            // Admin viewing all dealers' statistics
            appointments = appointmentRepository.findByDateRange(startDate, endDate);
        } else {
            // Dealer manager viewing their dealer's statistics
            appointments = appointmentRepository.findByDealerIdAndDateRange(dealerId, startDate, endDate);
        }

        long total = appointments.size();
        long scheduled = appointments.stream().filter(a -> STATUS_SCHEDULED.equals(a.getStatus())).count();
        long confirmed = appointments.stream().filter(a -> STATUS_CONFIRMED.equals(a.getStatus())).count();
        long completed = appointments.stream().filter(a -> STATUS_COMPLETED.equals(a.getStatus())).count();
        long cancelled = appointments.stream().filter(a -> STATUS_CANCELLED.equals(a.getStatus())).count();

        double completionRate = total > 0 ? (completed * 100.0 / total) : 0.0;
        double cancellationRate = total > 0 ? (cancelled * 100.0 / total) : 0.0;

        // Thống kê theo model
        Map<String, Long> byModel = appointments.stream()
                .collect(Collectors.groupingBy(
                        a -> "Model " + a.getModelId(),
                        Collectors.counting()));

        // Thống kê theo staff
        Map<String, Long> byStaff = appointments.stream()
                .filter(a -> a.getStaffId() != null)
                .collect(Collectors.groupingBy(
                        a -> "Staff " + a.getStaffId(),
                        Collectors.counting()));

        // Thống kê theo ngày
        Map<String, Long> byDay = appointments.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getAppointmentDate().toLocalDate().toString(),
                        Collectors.counting()));

        return TestDriveStatisticsResponse.builder()
                .totalAppointments(total)
                .scheduledCount(scheduled)
                .confirmedCount(confirmed)
                .completedCount(completed)
                .cancelledCount(cancelled)
                .completionRate(completionRate)
                .cancellationRate(cancellationRate)
                .appointmentsByModel(byModel)
                .appointmentsByStaff(byStaff)
                .appointmentsByDay(byDay)
                .build();
    }

    /**
     * Kiểm tra trùng lịch của staff hoặc xe
     */
    private void validateNoConflicts(String staffId, Long modelId, Long variantId,
            LocalDateTime startTime, Integer durationMinutes, Long excludeAppointmentId) {
        if (startTime == null || durationMinutes == null) {
            return;
        }

        LocalDateTime endTime = startTime.plusMinutes(durationMinutes);

        // Kiểm tra trùng lịch nhân viên
        if (staffId != null && !staffId.isEmpty()) {
            List<TestDriveAppointment> staffConflicts = appointmentRepository.findConflictingAppointmentsByStaff(
                    staffId, startTime, endTime);

            // Loại trừ appointment hiện tại nếu đang update
            if (excludeAppointmentId != null) {
                staffConflicts = staffConflicts.stream()
                        .filter(a -> !a.getAppointmentId().equals(excludeAppointmentId))
                        .toList();
            }

            if (!staffConflicts.isEmpty()) {
                TestDriveAppointment conflict = staffConflicts.get(0);
                String conflictTime = conflict.getAppointmentDate()
                        .format(java.time.format.DateTimeFormatter.ofPattern(DATE_TIME_FORMAT_STD));
                throw new IllegalStateException(
                        String.format("Nhân viên đã có lịch hẹn vào lúc %s. Vui lòng chọn thời gian khác!",
                                conflictTime));
            }
        }

        // Kiểm tra trùng lịch xe
        if (modelId != null) {
            List<TestDriveAppointment> vehicleConflicts = appointmentRepository.findConflictingAppointmentsByVehicle(
                    modelId, variantId, startTime, endTime);

            // Loại trừ appointment hiện tại nếu đang update
            if (excludeAppointmentId != null) {
                vehicleConflicts = vehicleConflicts.stream()
                        .filter(a -> !a.getAppointmentId().equals(excludeAppointmentId))
                        .toList();
            }

            if (!vehicleConflicts.isEmpty()) {
                TestDriveAppointment conflict = vehicleConflicts.get(0);
                String conflictTime = conflict.getAppointmentDate()
                        .format(java.time.format.DateTimeFormatter.ofPattern(DATE_TIME_FORMAT_STD));
                throw new IllegalStateException(
                        String.format("⚠️ Xe đã có lịch lái thử vào lúc %s. Vui lòng chọn xe hoặc thời gian khác!",
                                conflictTime));
            }
        }
    }

    private TestDriveResponse mapToResponse(TestDriveAppointment appointment) {
        Customer customer = appointment.getCustomer();

        return TestDriveResponse.builder()
                .appointmentId(appointment.getAppointmentId())
                .customerId(customer.getCustomerId())
                .customerName(customer.getFirstName() + " " + customer.getLastName())
                .customerPhone(customer.getPhone())
                .customerEmail(customer.getEmail())
                .dealerId(appointment.getDealerId())
                .modelId(appointment.getModelId())
                .variantId(appointment.getVariantId())
                .vehicleModelName(appointment.getVehicleModelName())
                .vehicleVariantName(appointment.getVehicleVariantName())
                .staffId(appointment.getStaffId())
                .staffName(appointment.getStaffName())
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .durationMinutes(appointment.getDurationMinutes())
                .endTime(appointment.getEndTime())
                .testDriveLocation(appointment.getTestDriveLocation())
                .status(appointment.getStatus())
                .cancellationReason(appointment.getCancellationReason())
                .cancelledBy(appointment.getCancelledBy())
                .cancelledAt(appointment.getCancelledAt())
                .confirmedAt(appointment.getConfirmedAt())
                .completedAt(appointment.getCompletedAt())
                .customerNotes(appointment.getCustomerNotes())
                .staffNotes(appointment.getStaffNotes())
                .notificationSent(appointment.getNotificationSent())
                .reminderSent(appointment.getReminderSent())
                .isConfirmed(appointment.getIsConfirmed())
                .confirmationSentAt(appointment.getConfirmationSentAt())
                .confirmationExpiresAt(appointment.getConfirmationExpiresAt())
                .firstReminderSentAt(appointment.getFirstReminderSentAt())
                .secondReminderSentAt(appointment.getSecondReminderSentAt())
                .feedbackRating(appointment.getFeedbackRating())
                .feedbackComment(appointment.getFeedbackComment())
                .createdBy(appointment.getCreatedBy())
                .createdAt(appointment.getCreatedAt())
                .updatedBy(appointment.getUpdatedBy())
                .updatedAt(appointment.getUpdatedAt())
                .build();
    }

    private TestDriveCalendarResponse mapToCalendarResponse(TestDriveAppointment appointment) {
        Customer customer = appointment.getCustomer();
        String title = String.format("Lái thử Model %d - %s",
                appointment.getModelId(),
                customer.getFirstName() + " " + customer.getLastName());

        TestDriveCalendarResponse response = TestDriveCalendarResponse.builder()
                .appointmentId(appointment.getAppointmentId())
                .title(title)
                .start(appointment.getAppointmentDate())
                .end(appointment.getEndTime())
                .customerId(customer.getCustomerId())
                .customerName(customer.getFirstName() + " " + customer.getLastName())
                .customerPhone(customer.getPhone())
                .modelId(appointment.getModelId())
                .variantId(appointment.getVariantId())
                .staffId(appointment.getStaffId())
                .location(appointment.getTestDriveLocation())
                .customerNotes(appointment.getCustomerNotes())
                .staffNotes(appointment.getStaffNotes())
                .build();

        response.setStatusWithColor(appointment.getStatus());
        return response;
    }

    /**
     * Ghi lại kết quả lái thử và phản hồi của khách hàng
     * Chỉ cho phép ghi feedback khi appointment đã COMPLETED
     */
    @Transactional
    public TestDriveResponse submitFeedback(Long id, TestDriveFeedbackRequest request) {
        TestDriveAppointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(APPOINTMENT_NOT_FOUND_PREFIX + id));

        // Validate: Chỉ cho phép ghi feedback khi đã hoàn thành
        if (!STATUS_COMPLETED.equals(appointment.getStatus())) {
            throw new IllegalStateException(
                    "Can only submit feedback for completed appointments. Current status: " + appointment.getStatus());
        }

        // Cập nhật feedback
        appointment.setFeedbackRating(request.getFeedbackRating());
        appointment.setFeedbackComment(request.getFeedbackComment());

        // Cập nhật staff notes nếu có
        if (request.getStaffNotes() != null && !request.getStaffNotes().isEmpty()) {
            String existingNotes = appointment.getStaffNotes() != null ? appointment.getStaffNotes() : "";
            String newNotes = existingNotes.isEmpty()
                    ? "[Feedback] " + request.getStaffNotes()
                    : existingNotes + "\n[Feedback] " + request.getStaffNotes();
            appointment.setStaffNotes(newNotes);
        }

        if (request.getUpdatedBy() != null) {
            appointment.setUpdatedBy(request.getUpdatedBy());
        }

        TestDriveAppointment updatedAppointment = appointmentRepository.save(appointment);

        log.info("✅ Feedback submitted for appointment ID: {} - Rating: {}/5",
                id, request.getFeedbackRating());

        return mapToResponse(updatedAppointment);
    }

    /**
     * Lấy danh sách appointments đã có feedback (để thống kê)
     */
    @Transactional(readOnly = true)
    public List<TestDriveResponse> getAppointmentsWithFeedback(String dealerId) {
        return appointmentRepository.findByDealerId(dealerId).stream()
                .filter(apt -> apt.getFeedbackRating() != null)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}
