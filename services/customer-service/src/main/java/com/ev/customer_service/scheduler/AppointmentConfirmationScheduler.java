package com.ev.customer_service.scheduler;

import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.entity.TestDriveAppointment;
import com.ev.customer_service.repository.TestDriveAppointmentRepository;
import com.ev.customer_service.service.EmailConfirmationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler để:
 * 1. Gửi reminder email sau 1 ngày chưa xác nhận
 * 2. Gửi reminder email sau 2 ngày chưa xác nhận
 * 3. Tự động hủy lịch sau 3 ngày chưa xác nhận
 * 4. Tự động hủy lịch nếu gần ngày hẹn mà chưa xác nhận
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentConfirmationScheduler {

    private final TestDriveAppointmentRepository appointmentRepository;
    private final EmailConfirmationService emailService;

    /**
     * Chạy mỗi giờ để kiểm tra và xử lý
     * Cron: 0 0 * * * * = chạy mỗi giờ
     */
    @Scheduled(cron = "${confirmation.schedule.cron:0 0 * * * *}")
    @Transactional
    public void processConfirmations() {
        log.info("🔄 Starting appointment confirmation scheduler...");
        
        try {
            // 1. Gửi reminder lần 1 (sau 1 ngày)
            sendFirstReminders();
            
            // 2. Gửi reminder lần 2 (sau 2 ngày)
            sendSecondReminders();
            
            // 3. Tự động hủy lịch hết hạn (sau 3 ngày)
            expireUnconfirmedAppointments();
            
            // 4. Tự động hủy lịch gần ngày hẹn mà chưa xác nhận
            expireNearAppointments();
            
            log.info("✅ Completed appointment confirmation scheduler");
        } catch (Exception e) {
            log.error("❌ Error in confirmation scheduler", e);
        }
    }

    /**
     * Gửi reminder lần 1: sau 1 ngày chưa xác nhận
     */
    private void sendFirstReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneDayAgo = now.minusDays(1);
        
        // Tìm các lịch:
        // - Đã gửi email xác nhận cách đây 1 ngày
        // - Chưa xác nhận (isConfirmed = false)
        // - Chưa gửi reminder lần 1
        // - Chưa hủy, chưa hoàn thành
        List<TestDriveAppointment> appointments = appointmentRepository.findAll().stream()
            .filter(apt -> apt.getConfirmationSentAt() != null)
            .filter(apt -> apt.getConfirmationSentAt().isBefore(oneDayAgo))
            .filter(apt -> !Boolean.TRUE.equals(apt.getIsConfirmed()))
            .filter(apt -> apt.getFirstReminderSentAt() == null)
            .filter(apt -> "SCHEDULED".equals(apt.getStatus()))
            .toList();

        log.info("📧 Found {} appointments needing first reminder", appointments.size());

        for (TestDriveAppointment appointment : appointments) {
            try {
                Customer customer = appointment.getCustomer();
                String customerName = customer.getFirstName() + " " + customer.getLastName();
                
                // Lấy thông tin vehicle từ DB (đã lưu khi tạo appointment)
                String vehicleModel = appointment.getVehicleModelName();
                String vehicleVariant = appointment.getVehicleVariantName();
                
                emailService.sendFirstReminderEmail(appointment, customer.getEmail(), customerName,
                                                   vehicleModel, vehicleVariant);
                
                appointment.setFirstReminderSentAt(now);
                appointmentRepository.save(appointment);
                
                log.info("✅ Sent first reminder for appointment ID: {}", appointment.getAppointmentId());
            } catch (Exception e) {
                log.error("❌ Failed to send first reminder for appointment ID: {}", 
                         appointment.getAppointmentId(), e);
            }
        }
    }

    /**
     * Gửi reminder lần 2: sau 2 ngày chưa xác nhận
     */
    private void sendSecondReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime twoDaysAgo = now.minusDays(2);
        
        // Tìm các lịch:
        // - Đã gửi email xác nhận cách đây 2 ngày
        // - Chưa xác nhận
        // - Đã gửi reminder lần 1
        // - Chưa gửi reminder lần 2
        List<TestDriveAppointment> appointments = appointmentRepository.findAll().stream()
            .filter(apt -> apt.getConfirmationSentAt() != null)
            .filter(apt -> apt.getConfirmationSentAt().isBefore(twoDaysAgo))
            .filter(apt -> !Boolean.TRUE.equals(apt.getIsConfirmed()))
            .filter(apt -> apt.getFirstReminderSentAt() != null)
            .filter(apt -> apt.getSecondReminderSentAt() == null)
            .filter(apt -> "SCHEDULED".equals(apt.getStatus()))
            .toList();

        log.info("📧 Found {} appointments needing second reminder", appointments.size());

        for (TestDriveAppointment appointment : appointments) {
            try {
                Customer customer = appointment.getCustomer();
                String customerName = customer.getFirstName() + " " + customer.getLastName();
                
                // Lấy thông tin vehicle từ DB (đã lưu khi tạo appointment)
                String vehicleModel = appointment.getVehicleModelName();
                String vehicleVariant = appointment.getVehicleVariantName();
                
                emailService.sendSecondReminderEmail(appointment, customer.getEmail(), customerName,
                                                    vehicleModel, vehicleVariant);
                
                appointment.setSecondReminderSentAt(now);
                appointmentRepository.save(appointment);
                
                log.info("✅ Sent second reminder for appointment ID: {}", appointment.getAppointmentId());
            } catch (Exception e) {
                log.error("❌ Failed to send second reminder for appointment ID: {}", 
                         appointment.getAppointmentId(), e);
            }
        }
    }

    /**
     * Tự động hủy lịch sau 3 ngày chưa xác nhận
     */
    private void expireUnconfirmedAppointments() {
        LocalDateTime now = LocalDateTime.now();
        
        // Tìm các lịch:
        // - Hết hạn xác nhận (confirmationExpiresAt < now)
        // - Chưa xác nhận
        // - Chưa hủy, chưa hoàn thành
        List<TestDriveAppointment> appointments = appointmentRepository.findAll().stream()
            .filter(apt -> apt.getConfirmationExpiresAt() != null)
            .filter(apt -> apt.getConfirmationExpiresAt().isBefore(now))
            .filter(apt -> !Boolean.TRUE.equals(apt.getIsConfirmed()))
            .filter(apt -> "SCHEDULED".equals(apt.getStatus()))
            .toList();

        log.info("⏰ Found {} appointments to expire (3 days without confirmation)", appointments.size());

        for (TestDriveAppointment appointment : appointments) {
            try {
                Customer customer = appointment.getCustomer();
                String customerName = customer.getFirstName() + " " + customer.getLastName();
                
                // Đổi status sang EXPIRED
                appointment.setStatus("EXPIRED");
                appointment.setCancellationReason("Hết hạn xác nhận - không xác nhận trong 3 ngày");
                appointment.setCancelledBy("SYSTEM");
                appointment.setCancelledAt(now);
                appointmentRepository.save(appointment);
                
                // Lấy thông tin vehicle từ DB (đã lưu khi tạo appointment)
                String vehicleModel = appointment.getVehicleModelName();
                String vehicleVariant = appointment.getVehicleVariantName();
                
                // Gửi email thông báo
                emailService.sendExpirationEmail(appointment, customer.getEmail(), customerName,
                                               vehicleModel, vehicleVariant);
                
                log.info("✅ Expired appointment ID: {} (3 days without confirmation)", 
                        appointment.getAppointmentId());
            } catch (Exception e) {
                log.error("❌ Failed to expire appointment ID: {}", 
                         appointment.getAppointmentId(), e);
            }
        }
    }

    /**
     * Tự động hủy lịch nếu gần ngày hẹn (< 3 ngày) mà chưa xác nhận
     */
    private void expireNearAppointments() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime threeDaysLater = now.plusDays(3);
        
        // Tìm các lịch:
        // - Ngày hẹn trong vòng 3 ngày tới (appointmentDate < now + 3 days)
        // - Chưa xác nhận
        // - Chưa hủy, chưa hoàn thành
        List<TestDriveAppointment> appointments = appointmentRepository.findAll().stream()
            .filter(apt -> apt.getAppointmentDate() != null)
            .filter(apt -> apt.getAppointmentDate().isBefore(threeDaysLater))
            .filter(apt -> apt.getAppointmentDate().isAfter(now)) // Chưa qua ngày hẹn
            .filter(apt -> !Boolean.TRUE.equals(apt.getIsConfirmed()))
            .filter(apt -> "SCHEDULED".equals(apt.getStatus()))
            .toList();

        log.info("⏰ Found {} appointments to expire (within 3 days without confirmation)", 
                appointments.size());

        for (TestDriveAppointment appointment : appointments) {
            try {
                Customer customer = appointment.getCustomer();
                String customerName = customer.getFirstName() + " " + customer.getLastName();
                
                // Đổi status sang EXPIRED
                appointment.setStatus("EXPIRED");
                appointment.setCancellationReason("Hết hạn xác nhận - lịch hẹn đã gần mà chưa xác nhận");
                appointment.setCancelledBy("SYSTEM");
                appointment.setCancelledAt(now);
                appointmentRepository.save(appointment);
                
                // Lấy thông tin vehicle từ DB (đã lưu khi tạo appointment)
                String vehicleModel = appointment.getVehicleModelName();
                String vehicleVariant = appointment.getVehicleVariantName();
                
                // Gửi email thông báo
                emailService.sendExpirationEmail(appointment, customer.getEmail(), customerName,
                                               vehicleModel, vehicleVariant);
                
                log.info("✅ Expired appointment ID: {} (near appointment date without confirmation)", 
                        appointment.getAppointmentId());
            } catch (Exception e) {
                log.error("❌ Failed to expire near appointment ID: {}", 
                         appointment.getAppointmentId(), e);
            }
        }
    }
}
