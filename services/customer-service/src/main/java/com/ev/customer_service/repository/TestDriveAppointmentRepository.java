package com.ev.customer_service.repository;

import com.ev.customer_service.entity.TestDriveAppointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TestDriveAppointmentRepository extends JpaRepository<TestDriveAppointment, Long>, 
                                                        JpaSpecificationExecutor<TestDriveAppointment> {

    List<TestDriveAppointment> findByCustomerCustomerId(Long customerId);

    List<TestDriveAppointment> findByDealerId(String dealerId);

    List<TestDriveAppointment> findByStatus(String status);

    @Query("SELECT t FROM TestDriveAppointment t WHERE t.dealerId = :dealerId AND t.status = :status")
    List<TestDriveAppointment> findByDealerIdAndStatus(@Param("dealerId") String dealerId, @Param("status") String status);

    @Query("SELECT t FROM TestDriveAppointment t WHERE t.appointmentDate BETWEEN :startDate AND :endDate")
    List<TestDriveAppointment> findAppointmentsByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Kiểm tra trùng lịch của nhân viên
     * Tìm các lịch hẹn của staff trong khoảng thời gian chồng lấp
     */
    @Query(value = "SELECT * FROM test_drive_appointments t WHERE t.staff_id = :staffId " +
           "AND t.status IN ('SCHEDULED', 'CONFIRMED') " +
           "AND t.appointment_date < :endTime " +
           "AND DATE_ADD(t.appointment_date, INTERVAL t.duration_minutes MINUTE) > :startTime",
           nativeQuery = true)
    List<TestDriveAppointment> findConflictingAppointmentsByStaff(
            @Param("staffId") String staffId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    /**
     * Kiểm tra trùng lịch của xe (model hoặc variant)
     * Tìm các lịch hẹn của xe trong khoảng thời gian chồng lấp
     */
    @Query(value = "SELECT * FROM test_drive_appointments t WHERE " +
           "(t.model_id = :modelId OR t.variant_id = :variantId) " +
           "AND t.status IN ('SCHEDULED', 'CONFIRMED') " +
           "AND t.appointment_date < :endTime " +
           "AND DATE_ADD(t.appointment_date, INTERVAL t.duration_minutes MINUTE) > :startTime",
           nativeQuery = true)
    List<TestDriveAppointment> findConflictingAppointmentsByVehicle(
            @Param("modelId") Long modelId,
            @Param("variantId") Long variantId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    /**
     * Lấy lịch hẹn theo dealer và khoảng thời gian (cho calendar view)
     */
    @Query("SELECT t FROM TestDriveAppointment t " +
           "WHERE t.dealerId = :dealerId " +
           "AND t.appointmentDate BETWEEN :startDate AND :endDate " +
           "ORDER BY t.appointmentDate ASC")
    List<TestDriveAppointment> findByDealerIdAndDateRange(
            @Param("dealerId") String dealerId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Lấy lịch hẹn theo khoảng thời gian (tất cả dealers - cho admin)
     */
    @Query("SELECT t FROM TestDriveAppointment t " +
           "WHERE t.appointmentDate BETWEEN :startDate AND :endDate " +
           "ORDER BY t.appointmentDate ASC")
    List<TestDriveAppointment> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Lấy lịch hẹn theo staff và khoảng thời gian
     */
    @Query("SELECT t FROM TestDriveAppointment t " +
           "WHERE t.staffId = :staffId " +
           "AND t.appointmentDate BETWEEN :startDate AND :endDate " +
           "ORDER BY t.appointmentDate ASC")
    List<TestDriveAppointment> findByStaffIdAndDateRange(
            @Param("staffId") String staffId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Đếm số lịch hẹn theo status của dealer
     */
    @Query("SELECT COUNT(t) FROM TestDriveAppointment t WHERE t.dealerId = :dealerId AND t.status = :status")
    Long countByDealerIdAndStatus(@Param("dealerId") String dealerId, @Param("status") String status);

    /**
     * Tìm các lịch hẹn cần gửi nhắc nhở (trước 24h và chưa gửi)
     */
    @Query("SELECT t FROM TestDriveAppointment t WHERE t.status IN ('SCHEDULED', 'CONFIRMED') " +
           "AND t.reminderSent = false " +
           "AND t.appointmentDate BETWEEN :startTime AND :endTime")
    List<TestDriveAppointment> findAppointmentsNeedingReminder(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    /**
     * Thống kê số lịch hẹn theo model
     */
    @Query("SELECT t.modelId, COUNT(t) FROM TestDriveAppointment t " +
           "WHERE t.dealerId = :dealerId " +
           "AND t.appointmentDate BETWEEN :startDate AND :endDate " +
           "GROUP BY t.modelId")
    List<Object[]> countAppointmentsByModel(
            @Param("dealerId") String dealerId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    /**
     * Thống kê số lịch hẹn theo staff
     */
    @Query("SELECT t.staffId, COUNT(t) FROM TestDriveAppointment t " +
           "WHERE t.dealerId = :dealerId " +
           "AND t.appointmentDate BETWEEN :startDate AND :endDate " +
           "GROUP BY t.staffId")
    List<Object[]> countAppointmentsByStaff(
            @Param("dealerId") String dealerId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
