package com.ev.user_service.repository;

import com.ev.user_service.entity.UserDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserDeviceRepository extends JpaRepository<UserDevice, UUID> {
    Optional<UserDevice> findByUserIdAndFcmToken(UUID userId, String fcmToken);

    List<UserDevice> findByUserId(UUID userId);

    // ✅ Lấy tất cả thiết bị của user có role ADMIN
    @Query(value = """
                SELECT ud.*
                FROM user_devices ud
                JOIN user u ON u.id = ud.user_id
                JOIN user_role ur ON ur.user_id = u.id
                JOIN role r ON r.id = ur.role_id
                WHERE r.name = 'ADMIN'
            """, nativeQuery = true)
    List<UserDevice> findAllAdminDevices();

    Optional<UserDevice> findByFcmToken(String token);

}
