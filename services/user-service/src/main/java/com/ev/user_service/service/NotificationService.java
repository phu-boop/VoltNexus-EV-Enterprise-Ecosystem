package com.ev.user_service.service;

import com.ev.common_lib.event.PromotionCreatedEvent;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.user_service.dto.internal.PromotionDTO;
import com.ev.user_service.entity.Notification;
import com.ev.user_service.entity.UserDevice;
import com.ev.user_service.repository.NotificationRepository;
import com.ev.user_service.repository.UserDeviceRepository;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;


import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final UserDeviceRepository userDeviceRepository;
    private final NotificationRepository notificationRepository;

    public void sendPromotionNotificationToAdmins(PromotionDTO dto) {
        List<UserDevice> adminDevices = userDeviceRepository.findAllAdminDevices();

        for (UserDevice device : adminDevices) {
            Notification notification = new Notification();
            notification.setType("NEW_PROMOTION");
            notification.setTitle("Khuyến mãi mới cần phê duyệt");
            notification.setMessage(dto.getPromotionName() + " đang chờ phê duyệt");
            notification.setPromotionId(dto.getId());
            notificationRepository.save(notification);

            Message message = Message.builder()
                    .setToken(device.getFcmToken())
                    .setNotification(com.google.firebase.messaging.Notification.builder()
                            .setTitle(notification.getTitle())
                            .setBody(notification.getMessage())
                            .build())
                    .putData("promotionId", dto.getId().toString())
                    .build();

            try {
                FirebaseMessaging.getInstance().send(message);
            } catch (FirebaseMessagingException e) {
            }
        }
    }

    public List<Notification> findAll() {
        return notificationRepository.findAll();
    }

    public Notification markAsRead(UUID notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));
        n.setRead(true);
        n.setUpdatedAt(java.time.LocalDateTime.now());
        return notificationRepository.save(n);
    }

    public void markAllAsRead() {
        List<Notification> notifications = notificationRepository.findAll();
        notifications.forEach(n -> {
            if (!n.isRead()) {
                n.setRead(true);
                n.setUpdatedAt(java.time.LocalDateTime.now());
            }
        });
        notificationRepository.saveAll(notifications);
    }

    public void deleteNotification(UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));
        notificationRepository.delete(notification);
    }

    public void deleteAllNotifications() {
        notificationRepository.deleteAll();
    }

    // ✅ Kiểm tra idempotency
    public boolean existsByEventId(String eventId) {
        return notificationRepository.existsByEventId(eventId);
    }

    // ✅ Tạo notification record từ event Kafka
    public void createPromotionNotification(PromotionCreatedEvent event) {
        Notification notification = Notification.builder()
                .type("NEW_PROMOTION")
                .title("" + event.getPromotionName())
                .message(event.getDescription())
                .promotionId(event.getPromotionId())
                .eventId(event.getEventId()) // để idempotency
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .read(false)
                .build();

        notificationRepository.save(notification);
    }

    public void sendPromotionFCM(PromotionCreatedEvent event) {
        List<UserDevice> adminDevices = userDeviceRepository.findAllAdminDevices();

        for (UserDevice device : adminDevices) {
            try {
                Message message = Message.builder()
                        .setToken(device.getFcmToken())
                        .setNotification(com.google.firebase.messaging.Notification.builder()
                                .setTitle("" + event.getPromotionName())
                                .setBody(event.getDescription())
                                .build())
                        .putData("promotionId", event.getPromotionId().toString())
                        .putData("eventId", event.getEventId())
                        .build();

                FirebaseMessaging.getInstance().send(message);
            } catch (FirebaseMessagingException e) {
                System.err.println("❌ Failed to send FCM to token: " + device.getFcmToken());
                userDeviceRepository.delete(
                        userDeviceRepository.findByFcmToken(device.getFcmToken())
                                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_FOUND))
                );
            }
        }
    }
}
