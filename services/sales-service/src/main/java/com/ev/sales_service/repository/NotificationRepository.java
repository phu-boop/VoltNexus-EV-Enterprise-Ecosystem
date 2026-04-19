package com.ev.sales_service.repository;

import com.ev.sales_service.entity.Notification;
import com.ev.sales_service.enums.NotificationAudience;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    // Tìm thông báo theo nhóm đối tượng, sắp xếp mới nhất lên đầu
    Page<Notification> findByAudienceOrderByCreatedAtDesc(NotificationAudience audience, Pageable pageable);

    // Đếm số thông báo chưa đọc
    long countByAudienceAndIsReadFalse(NotificationAudience audience);

    @Transactional
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.audience = :audience AND n.isRead = false")
    int markAllAsReadByAudience(NotificationAudience audience);

    @Transactional
    long deleteByAudience(NotificationAudience audience);

    List<Notification> findAllByAudienceOrderByCreatedAtDesc(NotificationAudience audience);

    // Dùng để xóa TẤT CẢ khiếu nại khi giải quyết
    List<Notification> findAllByLink(String link);

    // Dùng để kiểm tra trùng lặp khi tạo khiếu nại
    Optional<Notification> findByLinkAndType(String link, String type);

    // /**
    // * Tìm tất cả thông báo của một nhóm,
    // * NHƯNG LOẠI TRỪ ra các loại (type) đã được xử lý bởi logic Tác vụ.
    // */
    // List<Notification> findAllByAudienceAndTypeNotInOrderByCreatedAtDesc(
    // NotificationAudience audience,
    // List<String> typesToExclude);

    // Tìm tất cả thông báo của một nhóm (DÙNG CHO getStaffNotifications (API GET)
    Page<Notification> findAllByAudience(NotificationAudience audience, Pageable pageable);

    // Tìm tất cả thông báo của một nhóm (Dùng cho deleteAllStaffNotifications (API
    // DELETE))
    List<Notification> findAllByAudience(NotificationAudience audience);
}
