package com.ev.customer_service.scheduler;

import com.ev.customer_service.entity.TestDriveAppointment;
import com.ev.customer_service.repository.TestDriveAppointmentRepository;
import com.ev.customer_service.service.TestDriveNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduled job để gửi nhắc nhở trước 24h cho lịch hẹn
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TestDriveReminderScheduler {

    private final TestDriveAppointmentRepository appointmentRepository;
    private final TestDriveNotificationService notificationService;

    /**
     * Chạy mỗi ngày lúc 10:00 sáng
     * Gửi reminder cho các lịch hẹn trong 24h tới
     */
    @Scheduled(cron = "${reminder.schedule.cron:0 0 10 * * *}")
    public void sendDailyReminders() {
        log.info("Starting daily reminder job...");
        
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime tomorrow = now.plusDays(1);
            
            // Tìm các lịch hẹn trong 24h tới chưa gửi reminder
            List<TestDriveAppointment> appointments = 
                appointmentRepository.findAppointmentsNeedingReminder(now, tomorrow);
            
            log.info("Found {} appointments needing reminder", appointments.size());
            
            for (TestDriveAppointment appointment : appointments) {
                try {
                    String customerName = appointment.getCustomer().getFirstName() + " " + 
                                        appointment.getCustomer().getLastName();
                    
                    notificationService.sendAppointmentReminder(
                        appointment,
                        appointment.getCustomer().getEmail(),
                        appointment.getCustomer().getPhone(),
                        customerName
                    );
                    
                    // Đánh dấu đã gửi reminder
                    appointment.setReminderSent(true);
                    appointmentRepository.save(appointment);
                    
                    log.info("Sent reminder for appointment ID: {}", appointment.getAppointmentId());
                } catch (Exception e) {
                    log.error("Failed to send reminder for appointment ID: {}", 
                             appointment.getAppointmentId(), e);
                }
            }
            
            log.info("Completed reminder job. Sent {} reminders", appointments.size());
        } catch (Exception e) {
            log.error("Error in reminder scheduler", e);
        }
    }

    /**
     * Tự động đổi status từ SCHEDULED sang CONFIRMED cho các lịch đã qua 2 giờ
     * Chạy mỗi giờ
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void autoConfirmScheduledAppointments() {
        // TODO: Implement if needed
    }
}
