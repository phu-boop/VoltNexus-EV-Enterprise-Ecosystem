package com.ev.customer_service.service;

import com.ev.customer_service.entity.TestDriveAppointment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.time.format.DateTimeFormatter;

/**
 * Service để gửi email xác nhận lịch hẹn lái thử
 * 
 * Email bao gồm:
 * - Link xác nhận lịch hẹn
 * - Link hủy lịch hẹn
 * - Thông tin chi tiết lịch hẹn
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailConfirmationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final String CHARSET_UTF8 = "UTF-8";
    private static final String API_TEST_DRIVES = "/customers/api/test-drives/";
    private static final String CONFIRM_TOKEN_PATH = "/confirm-by-token?token=";
    private static final String CANCEL_TOKEN_PATH = "/cancel-by-token?token=";
    private static final String PLATFORM_NAME = "EV Dealer Management Platform";
    private static final String CONTACT_INFO = "Hotline: 1900-xxxx | Email: support@evdealer.com";
    private static final String CSS_FONT_FAMILY = "Arial, sans-serif";
    private static final String CSS_COLOR_MAIN = "#667eea";
    private static final String CSS_COLOR_DANGER = "#dc3545";
    private static final String CSS_BG_CONTENT = "#f9f9f9";
    private static final String CSS_BORDER_RADIUS_TOP = "10px 10px 0 0";
    private static final String CSS_BORDER_RADIUS_BOTTOM = "0 0 10px 10px";
    private static final String CSS_MAX_WIDTH = "600px";
    private static final String CSS_BORDER_STD = "1px solid #ddd";
    private static final String CSS_COLOR_TEXT = "#333";
    private static final String MODEL_PREFIX = "Model #";

    /**
     * Gửi email xác nhận lịch hẹn lần đầu
     */
    public void sendConfirmationEmail(TestDriveAppointment appointment, String customerEmail, String customerName,
            String vehicleModel, String vehicleVariant, String staffName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, CHARSET_UTF8);

            helper.setFrom(fromEmail);
            helper.setTo(customerEmail);
            helper.setSubject("Xác nhận lịch hẹn lái thử xe - EV Dealer Platform");

            String htmlContent = buildConfirmationEmailHtml(appointment, customerName,
                    vehicleModel, vehicleVariant, staffName);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("✅ Sent confirmation email to {} for appointment ID: {}",
                    customerEmail, appointment.getAppointmentId());

        } catch (MessagingException e) {
            log.error("❌ Failed to send confirmation email to {}", customerEmail, e);
            throw new RuntimeException("Failed to send confirmation email", e);
        }
    }

    /**
     * Gửi email nhắc nhở lần 1 (sau 1 ngày chưa xác nhận)
     */
    public void sendFirstReminderEmail(TestDriveAppointment appointment, String customerEmail, String customerName,
            String vehicleModel, String vehicleVariant) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, CHARSET_UTF8);

            helper.setFrom(fromEmail);
            helper.setTo(customerEmail);
            helper.setSubject("⏰ Nhắc nhở: Vui lòng xác nhận lịch hẹn lái thử xe");

            String htmlContent = buildReminderEmailHtml(appointment, customerName, 1, vehicleModel, vehicleVariant);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("✅ Sent first reminder email to {} for appointment ID: {}",
                    customerEmail, appointment.getAppointmentId());

        } catch (MessagingException e) {
            log.error("❌ Failed to send first reminder email to {}", customerEmail, e);
        }
    }

    /**
     * Gửi email nhắc nhở lần 2 (sau 2 ngày chưa xác nhận)
     */
    public void sendSecondReminderEmail(TestDriveAppointment appointment, String customerEmail, String customerName,
            String vehicleModel, String vehicleVariant) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, CHARSET_UTF8);

            helper.setFrom(fromEmail);
            helper.setTo(customerEmail);
            helper.setSubject("⚠️ Nhắc nhở lần cuối: Xác nhận lịch hẹn lái thử xe");

            String htmlContent = buildReminderEmailHtml(appointment, customerName, 2, vehicleModel, vehicleVariant);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("✅ Sent second reminder email to {} for appointment ID: {}",
                    customerEmail, appointment.getAppointmentId());

        } catch (MessagingException e) {
            log.error("❌ Failed to send second reminder email to {}", customerEmail, e);
        }
    }

    /**
     * Gửi email thông báo lịch hẹn đã hết hạn/bị hủy
     */
    public void sendExpirationEmail(TestDriveAppointment appointment, String customerEmail, String customerName,
            String vehicleModel, String vehicleVariant) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, CHARSET_UTF8);

            helper.setFrom(fromEmail);
            helper.setTo(customerEmail);
            helper.setSubject("❌ Lịch hẹn lái thử xe đã hết hạn");

            String htmlContent = buildExpirationEmailHtml(appointment, customerName, vehicleModel, vehicleVariant);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("✅ Sent expiration email to {} for appointment ID: {}",
                    customerEmail, appointment.getAppointmentId());

        } catch (MessagingException e) {
            log.error("❌ Failed to send expiration email to {}", customerEmail, e);
        }
    }

    /**
     * Build HTML cho email xác nhận ban đầu
     */
    private String buildConfirmationEmailHtml(TestDriveAppointment appointment, String customerName,
            String vehicleModel, String vehicleVariant, String staffName) {
        String confirmUrl = baseUrl + API_TEST_DRIVES + appointment.getAppointmentId() +
                CONFIRM_TOKEN_PATH + appointment.getConfirmationToken();
        String cancelUrl = baseUrl + API_TEST_DRIVES + appointment.getAppointmentId() +
                CANCEL_TOKEN_PATH + appointment.getConfirmationToken();

        // Format vehicle info
        String vehicleInfo;
        if (vehicleModel != null && vehicleVariant != null) {
            vehicleInfo = vehicleModel + " - " + vehicleVariant;
        } else {
            String variantPart = (appointment.getVariantId() != null)
                    ? " - Variant #" + appointment.getVariantId()
                    : " - Variant #N/A";
            vehicleInfo = MODEL_PREFIX + appointment.getModelId() + variantPart;
        }

        // Format staff info
        String staffInfo = (staffName != null && !staffName.isEmpty())
                ? staffName
                : "Staff ID: " + appointment.getStaffId();

        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: %s;
                            line-height: 1.6;
                            color: %s;
                            max-width: %s;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, %s 0%%, #764ba2 100%%);
                            color: white;
                            padding: 30px;
                            border-radius: %s;
                            text-align: center;
                        }
                        .content {
                            background: %s;
                            padding: 30px;
                            border: %s;
                        }
                        .info-box {
                            background: white;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                            border-left: 4px solid %s;
                        }
                        .info-row {
                            padding: 10px 0;
                            border-bottom: 1px solid #eee;
                        }
                        .info-row:last-child {
                            border-bottom: none;
                        }
                        .label {
                            font-weight: bold;
                            color: %s;
                            display: inline-block;
                            width: 140px;
                        }
                        .button-container {
                            text-align: center;
                            margin: 30px 0;
                        }
                        .btn {
                            display: inline-block;
                            padding: 12px 30px;
                            margin: 10px;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                            font-size: 16px;
                        }
                        .btn-confirm {
                            background: #28a745;
                            color: white;
                        }
                        .btn-cancel {
                            background: %s;
                            color: white;
                        }
                        .btn-view {
                            background: #007bff;
                            color: white;
                        }
                        .warning {
                            background: #fff3cd;
                            border: 1px solid #ffc107;
                            padding: 15px;
                            border-radius: 5px;
                            margin: 20px 0;
                            color: #856404;
                        }
                        .footer {
                            background: #f1f1f1;
                            padding: 20px;
                            text-align: center;
                            border-radius: %s;
                            font-size: 12px;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>🚗 Xác Nhận Lịch Hẹn Lái Thử Xe</h1>
                    </div>

                    <div class="content">
                        <p>Kính gửi <strong>%s</strong>,</p>

                        <p>Cảm ơn bạn đã đăng ký lịch hẹn lái thử xe tại <strong>EV Dealer Platform</strong>!</p>

                        <div class="info-box">
                            <h3 style="margin-top: 0; color: %s;">📋 Thông tin lịch hẹn</h3>
                            <div class="info-row">
                                <span class="label">📅 Thời gian:</span>
                                <span>%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">⏱️ Thời lượng:</span>
                                <span>%d phút</span>
                            </div>
                            <div class="info-row">
                                <span class="label">📍 Địa điểm:</span>
                                <span>%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">🚗 Mẫu xe:</span>
                                <span>%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">👤 Nhân viên:</span>
                                <span>%s</span>
                            </div>
                        </div>

                        <div class="warning">
                            <strong>⚠️ Quan trọng:</strong>
                            Vui lòng xác nhận lịch hẹn trong vòng <strong>3 ngày</strong> kể từ bây giờ
                            (trước %s). Nếu không xác nhận, lịch hẹn sẽ tự động bị hủy.
                        </div>

                        <div class="button-container">
                            <a href="%s" class="btn btn-confirm">XÁC NHẬN LỊCH HẸN</a>
                            <a href="%s" class="btn btn-cancel">HỦY LỊCH HẸN</a>
                        </div>

                        <p style="margin-top: 30px; font-size: 14px; color: #666;">
                            <strong>Lưu ý:</strong> Nếu bạn không thể đến vào thời gian đã đặt,
                            vui lòng hủy lịch hẹn hoặc liên hệ với chúng tôi để đổi lịch khác.
                        </p>
                    </div>

                    <div class="footer">
                        <p><strong>%s</strong></p>
                        <p>%s</p>
                        <p style="color: #999; font-size: 11px;">
                            Email này được gửi tự động, vui lòng không trả lời.
                        </p>
                    </div>
                </body>
                </html>
                """,
                CSS_FONT_FAMILY, CSS_COLOR_TEXT, CSS_MAX_WIDTH, CSS_COLOR_MAIN, CSS_BORDER_RADIUS_TOP,
                CSS_BG_CONTENT, CSS_BORDER_STD, CSS_COLOR_MAIN, CSS_COLOR_MAIN,
                CSS_COLOR_DANGER, CSS_BORDER_RADIUS_BOTTOM,
                customerName,
                CSS_COLOR_MAIN,
                appointment.getAppointmentDate().format(DATE_FORMATTER),
                appointment.getDurationMinutes(),
                appointment.getTestDriveLocation(),
                vehicleInfo,
                staffInfo,
                appointment.getConfirmationExpiresAt().format(DATE_FORMATTER),
                confirmUrl,
                cancelUrl,
                PLATFORM_NAME,
                CONTACT_INFO);
    }

    /**
     * Build HTML cho email nhắc nhở
     */
    private String buildReminderEmailHtml(TestDriveAppointment appointment, String customerName, int reminderNumber,
            String vehicleModel, String vehicleVariant) {
        String confirmUrl = baseUrl + API_TEST_DRIVES + appointment.getAppointmentId() +
                CONFIRM_TOKEN_PATH + appointment.getConfirmationToken();
        String cancelUrl = baseUrl + API_TEST_DRIVES + appointment.getAppointmentId() +
                CANCEL_TOKEN_PATH + appointment.getConfirmationToken();

        String urgencyMessage = reminderNumber == 1
                ? "Bạn chưa xác nhận lịch hẹn lái thử xe."
                : "⚠️ ĐÂY LÀ LẦN NHẮC NHỞ CUỐI CÙNG! Lịch hẹn sẽ tự động bị hủy nếu không xác nhận.";

        // Format vehicle info
        String vehicleInfo = (vehicleModel != null && vehicleVariant != null)
                ? vehicleModel + " - " + vehicleVariant
                : MODEL_PREFIX + appointment.getModelId();

        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: %s;
                            line-height: 1.6;
                            color: %s;
                            max-width: %s;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #f093fb 0%%, #f5576c 100%%);
                            color: white;
                            padding: 30px;
                            border-radius: %s;
                            text-align: center;
                        }
                        .content {
                            background: %s;
                            padding: 30px;
                            border: %s;
                        }
                        .urgent-box {
                            background: #fff3cd;
                            border: 2px solid #ff6b6b;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                            text-align: center;
                        }
                        .info-row {
                            padding: 10px 0;
                            border-bottom: 1px solid #eee;
                        }
                        .label {
                            font-weight: bold;
                            color: #f5576c;
                            display: inline-block;
                            width: 140px;
                        }
                        .button-container {
                            text-align: center;
                            margin: 30px 0;
                        }
                        .btn {
                            display: inline-block;
                            padding: 15px 35px;
                            margin: 10px;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                            font-size: 16px;
                        }
                        .btn-confirm {
                            background: #28a745;
                            color: white;
                        }
                        .btn-cancel {
                            background: %s;
                            color: white;
                        }
                        .footer {
                            background: #f1f1f1;
                            padding: 20px;
                            text-align: center;
                            border-radius: %s;
                            font-size: 12px;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>⏰ Nhắc Nhở Xác Nhận Lịch Hẹn</h1>
                    </div>

                    <div class="content">
                        <p>Kính gửi <strong>%s</strong>,</p>

                        <div class="urgent-box">
                            <h2 style="color: %s; margin: 0;">%s</h2>
                        </div>

                        <p>Lịch hẹn lái thử xe của bạn:</p>

                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <div class="info-row">
                                <span class="label">📅 Thời gian:</span>
                                <span>%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">📍 Địa điểm:</span>
                                <span>%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">🚗 Mẫu xe:</span>
                                <span>%s</span>
                            </div>
                            <div class="info-row" style="border-bottom: none;">
                                <span class="label">⏰ Hết hạn xác nhận:</span>
                                <span style="color: %s; font-weight: bold;">%s</span>
                            </div>
                        </div>

                        <div class="button-container">
                            <a href="%s" class="btn btn-confirm">✅ XÁC NHẬN NGAY</a>
                            <a href="%s" class="btn btn-cancel">❌ HỦY LỊCH HẸN</a>
                        </div>

                        <p style="text-align: center; color: #999; font-size: 14px;">
                            Nếu không thao tác, lịch hẹn sẽ tự động bị hủy.
                        </p>
                    </div>

                    <div class="footer">
                        <p><strong>%s</strong></p>
                        <p>%s</p>
                    </div>
                </body>
                </html>
                """,
                CSS_FONT_FAMILY, CSS_COLOR_TEXT, CSS_MAX_WIDTH, CSS_BORDER_RADIUS_TOP,
                CSS_BG_CONTENT, CSS_BORDER_STD, CSS_COLOR_DANGER, CSS_BORDER_RADIUS_BOTTOM,
                customerName,
                CSS_COLOR_DANGER, urgencyMessage,
                appointment.getAppointmentDate().format(DATE_FORMATTER),
                appointment.getTestDriveLocation(),
                vehicleInfo,
                CSS_COLOR_DANGER, appointment.getConfirmationExpiresAt().format(DATE_FORMATTER),
                confirmUrl,
                cancelUrl,
                PLATFORM_NAME,
                CONTACT_INFO);
    }

    /**
     * Build HTML cho email thông báo hết hạn
     */
    private String buildExpirationEmailHtml(TestDriveAppointment appointment, String customerName,
            String vehicleModel, String vehicleVariant) {
        // Format vehicle info
        String vehicleInfo = (vehicleModel != null && vehicleVariant != null)
                ? vehicleModel + " - " + vehicleVariant
                : MODEL_PREFIX + appointment.getModelId();
        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: %s;
                            line-height: 1.6;
                            color: %s;
                            max-width: %s;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #868f96 0%%, #596164 100%%);
                            color: white;
                            padding: 30px;
                            border-radius: %s;
                            text-align: center;
                        }
                        .content {
                            background: %s;
                            padding: 30px;
                            border: %s;
                        }
                        .expired-box {
                            background: #f8d7da;
                            border: 2px solid %s;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                            text-align: center;
                        }
                        .footer {
                            background: #f1f1f1;
                            padding: 20px;
                            text-align: center;
                            border-radius: %s;
                            font-size: 12px;
                            color: #666;
                        }
                        .cta-box {
                            background: #d1ecf1;
                            border: 1px solid #bee5eb;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>❌ Lịch Hẹn Đã Hết Hạn</h1>
                    </div>

                    <div class="content">
                        <p>Kính gửi <strong>%s</strong>,</p>

                        <div class="expired-box">
                            <h2 style="color: %s; margin: 0;">Lịch hẹn của bạn đã hết hạn</h2>
                            <p style="margin: 10px 0 0 0;">Do không xác nhận trong thời hạn quy định</p>
                        </div>

                        <p>Lịch hẹn lái thử xe <strong>%s</strong> vào <strong>%s</strong> tại <strong>%s</strong>
                        đã bị hủy do không được xác nhận trong vòng 3 ngày.</p>

                        <div class="cta-box">
                            <h3 style="margin-top: 0; color: #0c5460;">💡 Bạn vẫn muốn lái thử?</h3>
                            <p>Vui lòng liên hệ với chúng tôi để đặt lịch mới:</p>
                            <ul style="text-align: left;">
                                <li>📞 Hotline: 1900-xxxx</li>
                                <li>📧 Email: support@evdealer.com</li>
                                <li>🌐 Website: evdealer.com</li>
                            </ul>
                        </div>

                        <p style="color: #666; font-size: 14px;">
                            Chúng tôi rất tiếc vì sự bất tiện này. Hy vọng được phục vụ bạn trong tương lai!
                        </p>
                    </div>

                    <div class="footer">
                        <p><strong>%s</strong></p>
                        <p>%s</p>
                    </div>
                </body>
                </html>
                """,
                CSS_FONT_FAMILY, CSS_COLOR_TEXT, CSS_MAX_WIDTH, CSS_BORDER_RADIUS_TOP,
                CSS_BG_CONTENT, CSS_BORDER_STD, CSS_COLOR_DANGER, CSS_BORDER_RADIUS_BOTTOM,
                customerName,
                CSS_COLOR_DANGER,
                vehicleInfo,
                appointment.getAppointmentDate().format(DATE_FORMATTER),
                appointment.getTestDriveLocation(),
                PLATFORM_NAME,
                CONTACT_INFO);
    }
}
