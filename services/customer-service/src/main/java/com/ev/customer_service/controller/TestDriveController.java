package com.ev.customer_service.controller;

import com.ev.customer_service.dto.request.CancelTestDriveRequest;
import com.ev.customer_service.dto.request.TestDriveFeedbackRequest;
import com.ev.customer_service.dto.request.TestDriveFilterRequest;
import com.ev.customer_service.dto.request.TestDriveRequest;
import com.ev.customer_service.dto.request.UpdateTestDriveRequest;
import com.ev.customer_service.dto.response.ApiResponse;
import com.ev.customer_service.dto.response.TestDriveCalendarResponse;
import com.ev.customer_service.dto.response.TestDriveResponse;
import com.ev.customer_service.dto.response.TestDriveStatisticsResponse;
import com.ev.customer_service.service.TestDriveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

import lombok.extern.slf4j.Slf4j;

/**
 * Controller cho quản lý lịch hẹn lái thử xe
 * 
 * Roles:
 * - DEALER_STAFF: Có thể tạo, cập nhật, xem lịch hẹn
 * - DEALER_MANAGER: Có thể xem tất cả lịch hẹn, thống kê
 * - CUSTOMER: Có thể xem lịch hẹn của mình
 */
@RestController
@RequestMapping("/customers/api/test-drives")
@RequiredArgsConstructor
@Slf4j
public class TestDriveController {

    private final TestDriveService testDriveService;

    /**
     * Lấy danh sách lịch hẹn theo dealer
     */
    @GetMapping("/dealer/{dealerId}")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<ApiResponse<List<TestDriveResponse>>> getTestDrivesByDealer(@PathVariable String dealerId) {
        List<TestDriveResponse> appointments = testDriveService.getAppointmentsByDealerId(dealerId);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    /**
     * Lấy danh sách lịch hẹn của customer theo profileId (UUID) (cho customer app)
     */
    @GetMapping("/profile/{profileId}")
    public ResponseEntity<ApiResponse<List<TestDriveResponse>>> getMyTestDrives(@PathVariable String profileId) {
        log.info("Getting test drives for profileId: {}", profileId);
        List<TestDriveResponse> appointments = testDriveService.getAppointmentsByProfileId(profileId);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    /**
     * Lấy danh sách lịch hẹn của customer (cho customer app)
     */
    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<List<TestDriveResponse>>> getTestDrivesByCustomer(@PathVariable Long customerId) {
        List<TestDriveResponse> appointments = testDriveService.getAppointmentsByCustomerId(customerId);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    /**
     * Lấy chi tiết một lịch hẹn
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<TestDriveResponse>> getTestDriveById(@PathVariable Long id) {
        TestDriveResponse appointment = testDriveService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success(appointment));
    }

    /**
     * Tạo lịch hẹn lái thử mới
     * User Story 1: Dealer Staff tạo lịch hẹn cho khách hàng
     */
    @PostMapping
    @PreAuthorize("hasRole('DEALER_STAFF')")
    public ResponseEntity<ApiResponse<TestDriveResponse>> createTestDrive(
            @Valid @RequestBody TestDriveRequest request) {
        TestDriveResponse appointment = testDriveService.createAppointment(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Test drive appointment created successfully", appointment));
    }

    /**
     * Cập nhật lịch hẹn lái thử
     * User Story 2: Dealer Staff cập nhật lịch hẹn
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DEALER_STAFF')")
    public ResponseEntity<ApiResponse<TestDriveResponse>> updateTestDrive(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTestDriveRequest request) {
        TestDriveResponse appointment = testDriveService.updateAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Test drive appointment updated successfully", appointment));
    }

    /**
     * Hủy lịch hẹn lái thử
     * User Story 2: Dealer Staff hủy lịch hẹn
     */
    @DeleteMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> cancelTestDrive(
            @PathVariable Long id,
            @Valid @RequestBody CancelTestDriveRequest request) {
        testDriveService.cancelAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Test drive appointment cancelled successfully", null));
    }

    /**
     * Hủy lịch hẹn lái thử (cho customer)
     * Endpoint riêng cho customer có thể cancel lịch hẹn của mình
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> cancelTestDriveByCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CancelTestDriveRequest request) {
        testDriveService.cancelAppointment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Test drive appointment cancelled successfully", null));
    }

    /**
     * Xác nhận lịch hẹn (dành cho staff)
     */
    @PutMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> confirmTestDrive(@PathVariable Long id) {
        testDriveService.confirmAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Test drive appointment confirmed successfully", null));
    }

    /**
     * Xác nhận lịch hẹn qua token (từ link trong email)
     * Endpoint này không cần authentication vì khách hàng click từ email
     */
    @GetMapping("/{id}/confirm-by-token")
    public ResponseEntity<String> confirmTestDriveByToken(
            @PathVariable Long id,
            @RequestParam String token) {
        try {
            testDriveService.confirmAppointmentByToken(id, token);

            // Trả về HTML page đẹp thông báo thành công
            String html = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Xác nhận thành công</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                min-height: 100vh;
                                margin: 0;
                                background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                            }
                            .container {
                                background: white;
                                padding: 50px;
                                border-radius: 15px;
                                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                                text-align: center;
                                max-width: 500px;
                            }
                            .success-icon {
                                font-size: 80px;
                                color: #28a745;
                                margin-bottom: 20px;
                            }
                            h1 {
                                color: #333;
                                margin-bottom: 20px;
                            }
                            p {
                                color: #666;
                                line-height: 1.6;
                                margin-bottom: 30px;
                            }
                            .btn {
                                display: inline-block;
                                padding: 12px 30px;
                                background: #667eea;
                                color: white;
                                text-decoration: none;
                                border-radius: 5px;
                                font-weight: bold;
                            }
                            .btn:hover {
                                background: #5568d3;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="success-icon">✅</div>
                            <h1>Xác nhận thành công!</h1>
                            <p>
                                Lịch hẹn lái thử xe của bạn đã được xác nhận thành công.<br>
                                Chúng tôi sẽ liên hệ với bạn trước ngày hẹn.<br><br>
                                Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi!
                            </p>
                            <a href="${APP_FRONTEND_URL}" class="btn">Về trang chủ</a>
                        </div>
                    </body>
                    </html>
                    """;

            return ResponseEntity.ok()
                    .header("Content-Type", "text/html; charset=UTF-8")
                    .body(html);

        } catch (Exception e) {
            log.error("Failed to confirm appointment by token", e);

            String errorHtml = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Xác nhận thất bại</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                min-height: 100vh;
                                margin: 0;
                                background: linear-gradient(135deg, #f093fb 0%%, #f5576c 100%%);
                            }
                            .container {
                                background: white;
                                padding: 50px;
                                border-radius: 15px;
                                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                                text-align: center;
                                max-width: 500px;
                            }
                            .error-icon {
                                font-size: 80px;
                                color: #dc3545;
                                margin-bottom: 20px;
                            }
                            h1 {
                                color: #333;
                                margin-bottom: 20px;
                            }
                            p {
                                color: #666;
                                line-height: 1.6;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="error-icon">❌</div>
                            <h1>Xác nhận thất bại</h1>
                            <p>
                                Không thể xác nhận lịch hẹn. Có thể link đã hết hạn hoặc không hợp lệ.<br><br>
                                Vui lòng liên hệ với chúng tôi để được hỗ trợ:<br>
                                📞 Hotline: 1900-xxxx<br>
                                📧 Email: support@evdealer.com
                            </p>
                        </div>
                    </body>
                    </html>
                    """;

            return ResponseEntity.badRequest()
                    .header("Content-Type", "text/html; charset=UTF-8")
                    .body(errorHtml);
        }
    }

    /**
     * Hủy lịch hẹn qua token (từ link trong email)
     * Endpoint này không cần authentication vì khách hàng click từ email
     */
    @GetMapping("/{id}/cancel-by-token")
    public ResponseEntity<String> cancelTestDriveByToken(
            @PathVariable Long id,
            @RequestParam String token) {
        try {
            testDriveService.cancelAppointmentByToken(id, token);

            String html = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Hủy lịch thành công</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                min-height: 100vh;
                                margin: 0;
                                background: linear-gradient(135deg, #868f96 0%%, #596164 100%%);
                            }
                            .container {
                                background: white;
                                padding: 50px;
                                border-radius: 15px;
                                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                                text-align: center;
                                max-width: 500px;
                            }
                            .info-icon {
                                font-size: 80px;
                                color: #ffc107;
                                margin-bottom: 20px;
                            }
                            h1 {
                                color: #333;
                                margin-bottom: 20px;
                            }
                            p {
                                color: #666;
                                line-height: 1.6;
                                margin-bottom: 30px;
                            }
                            .btn {
                                display: inline-block;
                                padding: 12px 30px;
                                background: #667eea;
                                color: white;
                                text-decoration: none;
                                border-radius: 5px;
                                font-weight: bold;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="info-icon">ℹ️</div>
                            <h1>Đã hủy lịch hẹn</h1>
                            <p>
                                Lịch hẹn lái thử xe của bạn đã được hủy thành công.<br><br>
                                Nếu bạn muốn đặt lịch mới, vui lòng liên hệ với chúng tôi:<br>
                                📞 Hotline: 1900-xxxx<br>
                                📧 Email: support@evdealer.com
                            </p>
                            <a href="${APP_FRONTEND_URL}" class="btn">Về trang chủ</a>
                        </div>
                    </body>
                    </html>
                    """;

            return ResponseEntity.ok()
                    .header("Content-Type", "text/html; charset=UTF-8")
                    .body(html);

        } catch (Exception e) {
            log.error("Failed to cancel appointment by token", e);

            String errorHtml = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Hủy lịch thất bại</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                min-height: 100vh;
                                margin: 0;
                                background: linear-gradient(135deg, #f093fb 0%%, #f5576c 100%%);
                            }
                            .container {
                                background: white;
                                padding: 50px;
                                border-radius: 15px;
                                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                                text-align: center;
                                max-width: 500px;
                            }
                            .error-icon {
                                font-size: 80px;
                                color: #dc3545;
                                margin-bottom: 20px;
                            }
                            h1 {
                                color: #333;
                                margin-bottom: 20px;
                            }
                            p {
                                color: #666;
                                line-height: 1.6;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="error-icon">❌</div>
                            <h1>Không thể hủy lịch</h1>
                            <p>
                                Không thể hủy lịch hẹn. Có thể link đã hết hạn hoặc không hợp lệ.<br><br>
                                Vui lòng liên hệ với chúng tôi để được hỗ trợ:<br>
                                📞 Hotline: 1900-xxxx<br>
                                📧 Email: support@evdealer.com
                            </p>
                        </div>
                    </body>
                    </html>
                    """;

            return ResponseEntity.badRequest()
                    .header("Content-Type", "text/html; charset=UTF-8")
                    .body(errorHtml);
        }
    }

    /**
     * Đánh dấu hoàn thành lịch hẹn
     */
    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> completeTestDrive(@PathVariable Long id) {
        testDriveService.completeAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Test drive appointment completed successfully", null));
    }

    /**
     * Filter lịch hẹn theo nhiều tiêu chí
     * User Story 3: Dealer Manager xem lịch với bộ lọc
     */
    @PostMapping("/filter")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<TestDriveResponse>>> filterTestDrives(
            @Valid @RequestBody TestDriveFilterRequest filter) {
        List<TestDriveResponse> appointments = testDriveService.filterAppointments(filter);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    /**
     * Lấy lịch hẹn dạng Calendar View
     * User Story 3: Dealer Manager xem lịch dạng calendar
     */
    @GetMapping("/calendar")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<TestDriveCalendarResponse>>> getCalendarView(
            @RequestParam(required = false) String dealerId, // Optional for ADMIN
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        // Nếu không truyền startDate/endDate, mặc định lấy 30 ngày từ hôm nay
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now().plusDays(30);
        }
        
        List<TestDriveCalendarResponse> calendar = testDriveService.getCalendarView(dealerId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(calendar));
    }

    /**
     * Lấy thống kê lịch hẹn
     * User Story 3: Dealer Manager xem thống kê
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('DEALER_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<TestDriveStatisticsResponse>> getStatistics(
            @RequestParam(required = false) String dealerId, // Optional for ADMIN
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        // Nếu không truyền startDate/endDate, mặc định lấy 30 ngày qua
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }
        
        TestDriveStatisticsResponse statistics = testDriveService.getStatistics(dealerId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }

    /**
     * Ghi lại kết quả lái thử và phản hồi của khách hàng
     * Chỉ staff/manager mới được ghi feedback
     */
    @PostMapping("/{id}/feedback")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<ApiResponse<TestDriveResponse>> submitFeedback(
            @PathVariable Long id,
            @Valid @RequestBody TestDriveFeedbackRequest request) {
        TestDriveResponse response = testDriveService.submitFeedback(id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Lấy danh sách appointments đã có feedback
     * Để xem lịch sử phản hồi và thống kê
     */
    @GetMapping("/with-feedback")
    @PreAuthorize("hasAnyRole('DEALER_STAFF', 'DEALER_MANAGER')")
    public ResponseEntity<ApiResponse<List<TestDriveResponse>>> getAppointmentsWithFeedback(
            @RequestParam String dealerId) {
        List<TestDriveResponse> appointments = testDriveService.getAppointmentsWithFeedback(dealerId);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    /**
     * Public endpoint for customers to book test drive (no authentication required)
     */
    @PostMapping("/public")
    public ResponseEntity<ApiResponse<TestDriveResponse>> createPublicTestDrive(
            @Valid @RequestBody com.ev.customer_service.dto.request.PublicTestDriveRequest request) {
        TestDriveResponse appointment = testDriveService.createPublicAppointment(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Test drive appointment created successfully", appointment));
    }
}
