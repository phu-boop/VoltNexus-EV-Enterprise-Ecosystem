package com.ev.sales_service.controller;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.sales_service.dto.response.NotificationDto;
import com.ev.sales_service.entity.Notification;
// import com.ev.sales_service.entity.OrderTracking;
import com.ev.sales_service.enums.NotificationAudience;
import com.ev.sales_service.enums.OrderStatusB2B;
// import com.ev.sales_service.enums.SaleOderType;
import com.ev.sales_service.repository.SalesOrderRepositoryB2B;
import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.mapper.NotificationMapper; // (Cần tạo file mapper này)
import com.ev.sales_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
// import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;
import java.util.Optional;
import java.util.List;
import java.util.ArrayList;
// import java.util.stream.Stream;
// import java.util.stream.Collectors;
// import java.time.LocalDateTime;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')") // Bảo vệ toàn bộ controller
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper; // Tiêm mapper
    private final SalesOrderRepositoryB2B salesOrderRepositoryB2B;

    // API lấy danh sách thông báo (đã lưu CSDL)
    @GetMapping("/staff")
    public ResponseEntity<ApiRespond<Page<NotificationDto>>> getStaffNotifications(
            @PageableDefault(size = 10) Pageable pageable) {

        // TẠO SẮP XẾP:
        // - isRead=ASC (false - chưa đọc - lên đầu)
        // - createdAt=DESC (mới nhất lên đầu)
        Sort sort = Sort.by(
                Sort.Order.asc("isRead"),
                Sort.Order.desc("createdAt"));
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                sort);

        Page<Notification> notificationPage = notificationRepository
                .findAllByAudience(NotificationAudience.STAFF, sortedPageable);

        // CHUYỂN ĐỔI SANG DTO
        Page<NotificationDto> dtoPage = notificationPage.map(notificationMapper::toDto);

        return ResponseEntity.ok(ApiRespond.success("Lấy thông báo thành công", dtoPage));
    }

    /**
     * API xóa tất cả thông báo STAFF,
     * nhưng bỏ qua các thông báo khiếu nại đang hoạt động (active).
     */
    @DeleteMapping("/staff/all")
    @Transactional
    public ResponseEntity<ApiRespond<String>> deleteAllStaffNotifications() {

        // Lấy TẤT CẢ thông báo của Staff
        List<Notification> allStaffNotifications = notificationRepository.findAllByAudience(NotificationAudience.STAFF);

        // Tách thành 2 nhóm: "đang khiếu nại" và "có thể xóa"
        List<Notification> notificationsToDelete = new ArrayList<>();
        List<Notification> activeDisputes = new ArrayList<>();

        for (Notification n : allStaffNotifications) {
            if ("ORDER_DISPUTED".equals(n.getType())) {
                // Kiểm tra xem đơn hàng CÓ THỰC SỰ đang DISPUTED không
                UUID orderId = extractOrderIdFromLink(n.getLink()); // Dùng hàm helper
                if (orderId != null) {
                    Optional<SalesOrder> orderOpt = salesOrderRepositoryB2B.findById(orderId);

                    if (orderOpt.isPresent() && OrderStatusB2B.DISPUTED.equals(orderOpt.get().getOrderStatus())) {
                        // ĐÂY LÀ KHIẾU NẠI ĐANG HOẠT ĐỘNG -> KHÔNG XÓA
                        activeDisputes.add(n);
                    } else {
                        // Đơn hàng đã giải quyết, hoặc không tìm thấy -> cho phép xóa
                        notificationsToDelete.add(n);
                    }
                } else {
                    notificationsToDelete.add(n); // Link hỏng? Cho phép xóa
                }
            } else {
                // Không phải DISPUTED (ví dụ ORDER_PLACED), cho phép xóa
                notificationsToDelete.add(n);
            }
        }

        // 3. Thực hiện xóa
        if (!notificationsToDelete.isEmpty()) {
            notificationRepository.deleteAllInBatch(notificationsToDelete); // Dùng deleteAllInBatch cho hiệu quả
        }

        // 4. Trả về thông báo
        String message = String.format("Đã xóa %d thông báo.", notificationsToDelete.size());
        if (!activeDisputes.isEmpty()) {
            message += String.format(" %d thông báo khiếu nại đang hoạt động đã được giữ lại.", activeDisputes.size());
        }

        return ResponseEntity.ok(ApiRespond.success("Xử lý hoàn tất", message));
    }

    // API đếm số thông báo chưa đọc
    @GetMapping("/staff/unread-count")
    public ResponseEntity<ApiRespond<Map<String, Long>>> getUnreadCount() {
        long count = notificationRepository.countByAudienceAndIsReadFalse(NotificationAudience.STAFF);
        return ResponseEntity.ok(ApiRespond.success("OK", Map.of("unreadCount", count)));
    }

    // API đánh dấu 1 thông báo là đã đọc
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiRespond<NotificationDto>> markAsRead(@PathVariable UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

        // (Kiểm tra xem user có quyền đọc noti này không nếu cần)

        notification.setRead(true);
        Notification savedNotification = notificationRepository.save(notification);

        return ResponseEntity.ok(ApiRespond.success("Đã đánh dấu đã đọc", notificationMapper.toDto(savedNotification)));
    }

    // API đánh dấu TẤT CẢ thông báo là đã đọc
    @PutMapping("/staff/read-all")
    public ResponseEntity<ApiRespond<String>> markAllAsRead() {
        int updatedCount = notificationRepository.markAllAsReadByAudience(NotificationAudience.STAFF);

        // Tách riêng message và data
        String message = "Đánh dấu tất cả đã đọc thành công";
        String data = "Đã cập nhật " + updatedCount + " thông báo";

        // FIX: Truyền vào 2 tham số (message, data)
        return ResponseEntity.ok(ApiRespond.success(message, data));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVM_STAFF')")
    @Transactional
    public ResponseEntity<ApiRespond<String>> deleteNotification(@PathVariable UUID id) {
        // 1. Tìm thông báo
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DATA_NOT_FOUND));

        // 2. Kiểm tra quyền (chỉ cho phép xóa thông báo của STAFF)
        if (notification.getAudience() != NotificationAudience.STAFF) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // 3. LOGIC MỚI: KIỂM TRA NẾU LÀ KHIẾU NẠI
        if ("ORDER_DISPUTED".equals(notification.getType())) {
            // Cố gắng lấy Order ID từ link (ví dụ: /evm/b2b-orders/...)
            UUID orderId = extractOrderIdFromLink(notification.getLink());

            if (orderId != null) {
                // Tìm đơn hàng tương ứng
                Optional<SalesOrder> orderOpt = salesOrderRepositoryB2B.findById(orderId);
                if (orderOpt.isPresent()) {
                    SalesOrder order = orderOpt.get();

                    // 4. CHẶN XÓA NẾU ĐƠN HÀNG VẪN ĐANG BỊ KHIẾU NẠI
                    if (OrderStatusB2B.DISPUTED.equals(order.getOrderStatus())) {
                        throw new AppException(ErrorCode.BAD_REQUEST);
                    }
                }
            }
        }

        // 5. Nếu vượt qua các kiểm tra, tiến hành xóa
        notificationRepository.delete(notification);
        return ResponseEntity.ok(ApiRespond.success("Đã xóa thông báo", id.toString()));
    }

    /**
     * Hàm helper để trích xuất UUID từ chuỗi link
     */
    private UUID extractOrderIdFromLink(String link) {
        if (link == null || link.isEmpty()) {
            return null;
        }
        try {
            String uuidString = link.substring(link.lastIndexOf('/') + 1);
            return UUID.fromString(uuidString);
        } catch (Exception e) {
            // (Ghi log lỗi nếu cần)
            return null;
        }
    }
}
