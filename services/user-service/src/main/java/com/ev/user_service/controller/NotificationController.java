package com.ev.user_service.controller;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.user_service.dto.internal.PromotionDTO;
import com.ev.user_service.entity.Notification;
import com.ev.user_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/promotions")
    public void handleNewPromotion(@RequestBody PromotionDTO dto) {
        notificationService.sendPromotionNotificationToAdmins(dto);
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiRespond<List<Notification>>> getAllNotifications() {
        return ResponseEntity.ok(ApiRespond.success("get all notification successful", notificationService.findAll()));
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiRespond<Object>> markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiRespond.success("mark readed", null));
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @PutMapping("/mark-all-read")
    public ResponseEntity<ApiRespond<Object>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(ApiRespond.success("All notifications marked as read", null));
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiRespond<Object>> deleteNotification(@PathVariable UUID id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(ApiRespond.success("Notification deleted successfully", null));
    }

    @PreAuthorize("hasAnyRole('ADMIN')")
    @DeleteMapping
    public ResponseEntity<ApiRespond<Object>> deleteAllNotifications() {
        notificationService.deleteAllNotifications();
        return ResponseEntity.ok(ApiRespond.success("All notifications deleted successfully", null));
    }

}
