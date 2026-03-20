package com.ev.sales_service.service.Implementation;

import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.sales_service.config.EmailConfig;
import com.ev.sales_service.dto.response.CustomerResponse;
import com.ev.sales_service.entity.OrderItem;
import com.ev.sales_service.entity.Quotation;
import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.service.Interface.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.exceptions.TemplateInputException;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final EmailConfig emailConfig;

    @Override
    public void sendQuotationEmail(Quotation quotation, CustomerResponse customer) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(customer.getEmail());
            helper.setSubject(String.format("Báo Giá Xe - %s", quotation.getQuotationId()));
            helper.setText(buildQuotationEmailContent(quotation, customer), true);

            mailSender.send(message);
            log.info("Quotation email sent successfully to: {}", customer.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send quotation email to: {}", customer.getEmail(), e);
            throw new AppException(ErrorCode.EMAIL_SENDING_FAILED);
        }
    }

    @Override
    public void sendQuotationAcceptedEmail(Quotation quotation, CustomerResponse customer) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(customer.getEmail());
            helper.setSubject(String.format("Xác Nhận Chấp Nhận Báo Giá - %s", quotation.getQuotationId()));
            helper.setText(buildQuotationAcceptedEmailContent(quotation, customer), true);

            mailSender.send(message);
            log.info("Quotation accepted email sent successfully to: {}", customer.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send quotation accepted email to: {}", customer.getEmail(), e);
            throw new AppException(ErrorCode.EMAIL_SENDING_FAILED);
        }
    }

    @Override
    public void sendQuotationRejectedEmail(Quotation quotation, CustomerResponse customer) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(customer.getEmail());
            helper.setSubject(String.format("Thông Báo Từ Chối Báo Giá - %s", quotation.getQuotationId()));
            helper.setText(buildQuotationRejectedEmailContent(quotation, customer), true);

            mailSender.send(message);
            log.info("Quotation rejected email sent successfully to: {}", customer.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send quotation rejected email to: {}", customer.getEmail(), e);
            throw new AppException(ErrorCode.EMAIL_SENDING_FAILED);
        }
    }

    @Override
    public void sendOrderConfirmedEmail(SalesOrder salesOrder, CustomerResponse customer, String showroomName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(customer.getEmail());
            helper.setSubject("Xác nhận đơn hàng #" + salesOrder.getOrderId());
            helper.setText(buildOrderConfirmedEmailContent(salesOrder, customer, showroomName), true);

            mailSender.send(message);
            log.info("Order confirmed email sent to: {}", customer.getEmail());
        } catch (MessagingException e) {
            log.error("Failed to send order confirmed email to: {}", customer.getEmail(), e);
            throw new AppException(ErrorCode.EMAIL_SENDING_FAILED);
        }
    }

    // =================== Build Email Content ===================

    private String buildQuotationEmailContent(Quotation quotation, CustomerResponse customer) {
        try {
            Context context = new Context(new Locale("vi"));
            context.setVariable("customer", customer);
            context.setVariable("quotation", quotation);
            context.setVariable("validUntil",
                    quotation.getValidUntil().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
            context.setVariable("quotationDate",
                    quotation.getQuotationDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

            // Add URLs
            context.setVariable("acceptUrl", emailConfig.getQuotationAcceptUrl(quotation.getQuotationId().toString()));
            context.setVariable("rejectUrl", emailConfig.getQuotationRejectUrl(quotation.getQuotationId().toString()));
            context.setVariable("frontendUrl", emailConfig.getFrontendUrl());

            return templateEngine.process("quotation-email", context);
        } catch (TemplateInputException e) {
            log.warn("Template 'quotation-email' not found, using fallback content");
            return buildFallbackQuotationEmailContent(quotation, customer);
        }
    }

    private String buildQuotationAcceptedEmailContent(Quotation quotation, CustomerResponse customer) {
        try {
            Context context = new Context(new Locale("vi"));
            context.setVariable("customer", customer);
            context.setVariable("quotation", quotation);
            return templateEngine.process("quotation-accepted-email", context);
        } catch (TemplateInputException e) {
            log.warn("Template 'quotation-accepted-email' not found, using fallback content");
            return buildFallbackQuotationAcceptedEmailContent(quotation, customer);
        }
    }

    private String buildQuotationRejectedEmailContent(Quotation quotation, CustomerResponse customer) {
        try {
            Context context = new Context(new Locale("vi"));
            context.setVariable("customer", customer);
            context.setVariable("quotation", quotation);
            return templateEngine.process("quotation-rejected-email", context);
        } catch (TemplateInputException e) {
            log.warn("Template 'quotation-rejected-email' not found, using fallback content");
            return buildFallbackQuotationRejectedEmailContent(quotation, customer);
        }
    }

    private String buildOrderConfirmedEmailContent(SalesOrder salesOrder, CustomerResponse customer,
            String showroomName) {
        try {
            Context context = new Context(new Locale("vi"));
            context.setVariable("customer", customer);
            context.setVariable("salesOrder", salesOrder);
            context.setVariable("showroomName", showroomName);
            context.setVariable("confirmUrl", emailConfig.getOrderConfirmUrl(salesOrder.getOrderId().toString()));
            context.setVariable("orderDate",
                    salesOrder.getOrderDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

            return templateEngine.process("order-confirmed-email", context);
        } catch (TemplateInputException e) {
            log.warn("Template 'order-confirmed-email' not found, using fallback content");
            return buildFallbackOrderConfirmedEmailContent(salesOrder, customer, showroomName);
        }
    }

    // =================== Fallback Content ===================

    private String buildFallbackQuotationEmailContent(Quotation quotation, CustomerResponse customer) {
        return String.format(
                "Kính gửi Quý khách %s,\n\n" +
                        "Cảm ơn Quý khách đã quan tâm đến sản phẩm của EV Automotive.\n\n" +
                        "Thông tin báo giá:\n" +
                        "- Mã báo giá: %s\n" +
                        "- Ngày báo giá: %s\n" +
                        "- Hiệu lực đến: %s\n" +
                        "- Giá cơ bản: %s VND\n" +
                        "- Giảm giá: %s VND\n" +
                        "- Giá cuối cùng: %s VND\n\n" +
                        "Điều khoản và điều kiện:\n%s\n\n" +
                        "Trân trọng,\nĐội ngũ EV Automotive",
                customer.getFullName(),
                quotation.getQuotationId(),
                quotation.getQuotationDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                quotation.getValidUntil().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                quotation.getBasePrice(),
                quotation.getDiscountAmount(),
                quotation.getFinalPrice(),
                quotation.getTermsConditions());
    }

    private String buildFallbackQuotationAcceptedEmailContent(Quotation quotation, CustomerResponse customer) {
        return String.format(
                "Kính gửi Quý khách %s,\n\n" +
                        "Quý khách đã chấp nhận báo giá %s.\n\n" +
                        "Chúng tôi sẽ liên hệ với Quý khách trong thời gian sớm nhất.\n\n" +
                        "Trân trọng,\nĐội ngũ EV Automotive",
                customer.getFullName(),
                quotation.getQuotationId());
    }

    private String buildFallbackQuotationRejectedEmailContent(Quotation quotation, CustomerResponse customer) {
        return String.format(
                "Kính gửi Quý khách %s,\n\n" +
                        "Quý khách đã từ chối báo giá %s.\n\n" +
                        "Nếu có thắc mắc, xin vui lòng liên hệ chúng tôi.\n\n" +
                        "Trân trọng,\nĐội ngũ EV Automotive",
                customer.getFullName(),
                quotation.getQuotationId());
    }

    private String buildFallbackOrderConfirmedEmailContent(SalesOrder salesOrder, CustomerResponse customer,
            String showroomName) {
        String confirmUrl = emailConfig.getOrderConfirmUrl(salesOrder.getOrderId().toString());
        StringBuilder itemsInfo = new StringBuilder();
        if (salesOrder.getOrderItems() != null && !salesOrder.getOrderItems().isEmpty()) {
            for (OrderItem item : salesOrder.getOrderItems()) {
                itemsInfo.append(String.format("- Xe: %s - Phiên bản: %s - Màu sắc: %s\n",
                        item.getModelName(), item.getVariantName(), item.getColor()));
            }
        }

        return String.format(
                "Kính gửi %s,\n\n" +
                        "Đơn hàng #%s của Quý khách đang chờ xác nhận.\n\n" +
                        "Chi tiết đơn hàng:\n" +
                        "%s" +
                        "- Showroom nhận xe: %s\n" +
                        "- Ngày tạo: %s\n" +
                        "- Tổng tiền: %s VND\n" +
                        "- Tiền đã cọc: %s VND\n" +
                        "- Số tiền còn lại: %s VND\n\n" +
                        "Vui lòng nhấn vào liên kết sau để xác nhận đơn hàng: %s\n\n" +
                        "Trân trọng,\nĐội ngũ EV Automotive",
                customer.getFullName(),
                salesOrder.getOrderId(),
                itemsInfo.toString(),
                showroomName != null ? showroomName : "N/A",
                salesOrder.getOrderDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                salesOrder.getTotalAmount(),
                salesOrder.getDownPayment(),
                salesOrder.getTotalAmount().subtract(salesOrder.getDownPayment()),
                confirmUrl);
    }
}