package com.ev.sales_service.mapper;

import com.ev.sales_service.dto.response.NotificationDto;
import com.ev.sales_service.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Mapper(componentModel = "spring") // Báo cho Spring biết đây là một bean
public interface NotificationMapper {

    // Chuyển từ Entity -> DTO
    @Mapping(target = "id", expression = "java(notification.getId().toString())") // Chuyển UUID sang String
    @Mapping(target = "time", source = "createdAt", qualifiedByName = "toRelativeTime") // Chuyển createdAt sang "time"
    @Mapping(target = "unread", source = "read", qualifiedByName = "isUnread") // Chuyển isRead sang unread
    NotificationDto toDto(Notification notification);

    // --- CÁC HÀM HELPER CHO VIỆC MAP ---

    // Hàm này sẽ chuyển đổi isRead (boolean) của Entity
    // thành unread (boolean) của DTO (isRead=false -> unread=true)
    @Named("isUnread")
    default boolean isUnread(boolean isRead) {
        return !isRead;
    }

    // Hàm này chuyển đổi LocalDateTime (ví dụ: 2025-11-08T14:30:00)
    // thành một chuỗi "time" thân thiện (ví dụ: "Vừa xong", "5 phút trước")
    @Named("toRelativeTime")
    default String toRelativeTime(LocalDateTime createdAt) {
        if (createdAt == null) {
            return "Không rõ";
        }

        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(createdAt, now);
        if (minutes < 1) {
            return "Vừa xong";
        }
        if (minutes < 60) {
            return minutes + " phút trước";
        }

        long hours = ChronoUnit.HOURS.between(createdAt, now);
        if (hours < 24) {
            return hours + " giờ trước";
        }

        long days = ChronoUnit.DAYS.between(createdAt, now);
        return days + " ngày trước";
    }
}
