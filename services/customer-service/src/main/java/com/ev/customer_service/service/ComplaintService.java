package com.ev.customer_service.service;

import com.ev.customer_service.dto.NotificationRequest;
import com.ev.customer_service.dto.request.*;
import com.ev.customer_service.dto.response.ComplaintResponse;
import com.ev.customer_service.dto.response.ComplaintStatisticsResponse;
import com.ev.customer_service.entity.Complaint;
import com.ev.customer_service.entity.Customer;
import com.ev.customer_service.enums.ComplaintSeverity;
import com.ev.customer_service.enums.ComplaintStatus;
import com.ev.customer_service.exception.ResourceNotFoundException;
import com.ev.customer_service.repository.ComplaintRepository;
import com.ev.customer_service.repository.CustomerRepository;
import com.ev.customer_service.specification.ComplaintSpecification;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service xử lý logic nghiệp vụ cho Quản lý Phản hồi & Khiếu nại
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CustomerRepository customerRepository;
    private final ObjectMapper objectMapper;
    private final org.springframework.mail.javamail.JavaMailSender mailSender;
    // TODO: Add KafkaTemplate when Kafka is configured
    // private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Tạo mới phản hồi/khiếu nại
     * Dealer Staff ghi nhận từ khách hàng
     */
    @Transactional
    public ComplaintResponse createComplaint(CreateComplaintRequest request) {
        log.info("Creating new complaint for customer: {}", request.getCustomerId());

        // Validate customer exists
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        // Create complaint entity
        Complaint complaint = new Complaint();
        complaint.setComplaintCode(generateComplaintCode());
        complaint.setCustomer(customer);
        complaint.setDealerId(request.getDealerId());
        complaint.setOrderId(request.getOrderId());
        complaint.setComplaintType(request.getComplaintType());
        complaint.setSeverity(request.getSeverity());
        complaint.setChannel(request.getChannel());
        complaint.setDescription(request.getDescription());
        complaint.setStatus(ComplaintStatus.NEW); // Mặc định là NEW
        complaint.setCreatedByStaffId(request.getCreatedByStaffId());
        complaint.setCreatedByStaffName(request.getCreatedByStaffName());
        complaint.setNotificationSent(false);

        Complaint saved = complaintRepository.save(complaint);
        log.info("Complaint created successfully with code: {}", saved.getComplaintCode());

        return mapToResponse(saved);
    }

    /**
     * Phân công xử lý phản hồi
     * Dealer Manager gán nhân viên và chuyển trạng thái
     */
    @Transactional
    public ComplaintResponse assignComplaint(Long complaintId, AssignComplaintRequest request) {
        log.info("Assigning complaint {} to staff {}", complaintId, request.getAssignedStaffId());

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        complaint.setAssignedStaffId(request.getAssignedStaffId());
        complaint.setAssignedStaffName(request.getAssignedStaffName());
        complaint.setInternalNotes(request.getInternalNotes());

        if (request.getStatus() != null) {
            complaint.setStatus(request.getStatus());
        } else {
            complaint.setStatus(ComplaintStatus.IN_PROGRESS); // Default khi gán
        }

        // Ghi lại thời gian phản hồi đầu tiên (SLA tracking)
        if (complaint.getFirstResponseAt() == null) {
            complaint.setFirstResponseAt(LocalDateTime.now());
        }

        Complaint saved = complaintRepository.save(complaint);

        // TODO: Gửi notification cho staff được gán
        sendNotificationToStaff(saved, "Bạn được gán xử lý phản hồi " + saved.getComplaintCode());

        return mapToResponse(saved);
    }

    /**
     * Cập nhật tiến độ xử lý
     * Staff thêm update note
     */
    @Transactional
    public ComplaintResponse addProgressUpdate(Long complaintId, ComplaintProgressUpdate update) {
        log.info("Adding progress update to complaint {}", complaintId);

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        // Parse existing progress updates
        List<ComplaintResponse.ProgressUpdateInfo> progressList = parseProgressUpdates(complaint.getProgressUpdates());

        // Add new update
        ComplaintResponse.ProgressUpdateInfo newUpdate = ComplaintResponse.ProgressUpdateInfo.builder()
                .updateNote(update.getUpdateNote())
                .updatedByStaffId(update.getUpdatedByStaffId())
                .updatedByStaffName(update.getUpdatedByStaffName())
                .updatedAt(LocalDateTime.now())
                .build();
        progressList.add(newUpdate);

        // Save back as JSON
        complaint.setProgressUpdates(serializeProgressUpdates(progressList));

        Complaint saved = complaintRepository.save(complaint);
        return mapToResponse(saved);
    }

    /**
     * Đánh dấu phản hồi đã giải quyết
     * Staff hoàn thành xử lý
     */
    @Transactional
    public ComplaintResponse resolveComplaint(Long complaintId, ResolveComplaintRequest request) {
        log.info("Resolving complaint {}", complaintId);

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        complaint.setStatus(ComplaintStatus.RESOLVED);
        
        // Set new fields
        complaint.setInternalResolution(request.getInternalResolution());
        complaint.setCustomerMessage(request.getCustomerMessage());
        
        // Set deprecated field for backward compatibility
        complaint.setResolution(request.getCustomerMessage());
        
        complaint.setResolvedDate(LocalDateTime.now());

        Complaint saved = complaintRepository.save(complaint);

        // Gửi notification cho khách hàng nếu yêu cầu
        if (Boolean.TRUE.equals(request.getSendNotification())) {
            sendResolutionNotificationToCustomer(saved);
        }

        return mapToResponse(saved);
    }

    /**
     * Đóng phản hồi
     * Manager xác nhận đóng sau khi resolved
     */
    @Transactional
    public ComplaintResponse closeComplaint(Long complaintId) {
        log.info("Closing complaint {}", complaintId);

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));

        if (!complaint.getStatus().equals(ComplaintStatus.RESOLVED)) {
            throw new IllegalStateException("Can only close resolved complaints");
        }

        complaint.setStatus(ComplaintStatus.CLOSED);
        Complaint saved = complaintRepository.save(complaint);

        return mapToResponse(saved);
    }

    /**
     * Lấy chi tiết phản hồi
     */
    public ComplaintResponse getComplaintById(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + complaintId));
        return mapToResponse(complaint);
    }

    /**
     * Lấy danh sách phản hồi theo dealer
     */
    public List<ComplaintResponse> getComplaintsByDealer(Long dealerId) {
        List<Complaint> complaints = complaintRepository.findByDealerId(dealerId);
        return complaints.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Filter phản hồi theo nhiều tiêu chí
     * Hỗ trợ pagination và sorting
     */
    public Page<ComplaintResponse> filterComplaints(ComplaintFilterRequest filter) {
        log.info("Filtering complaints with criteria: {}", filter);

        // Build specification
        Specification<Complaint> spec = (root, query, cb) -> cb.conjunction();

        if (filter.getDealerId() != null) {
            spec = spec.and(ComplaintSpecification.hasDealerId(filter.getDealerId()));
        }
        if (filter.getStatus() != null) {
            spec = spec.and(ComplaintSpecification.hasStatus(filter.getStatus()));
        }
        if (filter.getComplaintType() != null) {
            spec = spec.and(ComplaintSpecification.hasType(filter.getComplaintType()));
        }
        if (filter.getSeverity() != null) {
            spec = spec.and(ComplaintSpecification.hasSeverity(filter.getSeverity()));
        }
        if (filter.getAssignedStaffId() != null) {
            spec = spec.and(ComplaintSpecification.hasAssignedStaff(filter.getAssignedStaffId()));
        }
        if (filter.getCustomerId() != null) {
            spec = spec.and(ComplaintSpecification.hasCustomerId(filter.getCustomerId()));
        }
        if (filter.getStartDate() != null && filter.getEndDate() != null) {
            spec = spec.and(ComplaintSpecification.createdBetween(filter.getStartDate(), filter.getEndDate()));
        }

        // Sorting
        Sort sort = Sort.by(
            filter.getSortDirection().equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC,
            filter.getSortBy()
        );

        // Pagination
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        Page<Complaint> page = complaintRepository.findAll(spec, pageable);

        return page.map(this::mapToResponse);
    }

    /**
     * Lấy thống kê phản hồi
     * Dealer Manager xem overview
     */
    public ComplaintStatisticsResponse getStatistics(Long dealerId, LocalDateTime startDate, LocalDateTime endDate) {
        log.info("Getting complaint statistics for dealer {} from {} to {}", dealerId, startDate, endDate);

        // Count total with date range
        Long total = complaintRepository.countByDealerIdAndDateRange(dealerId, startDate, endDate);

        // Count by status with date range
        Long newCount = complaintRepository.countByDealerIdAndStatusAndDateRange(dealerId, ComplaintStatus.NEW, startDate, endDate);
        Long inProgressCount = complaintRepository.countByDealerIdAndStatusAndDateRange(dealerId, ComplaintStatus.IN_PROGRESS, startDate, endDate);
        Long resolvedCount = complaintRepository.countByDealerIdAndStatusAndDateRange(dealerId, ComplaintStatus.RESOLVED, startDate, endDate);
        Long closedCount = complaintRepository.countByDealerIdAndStatusAndDateRange(dealerId, ComplaintStatus.CLOSED, startDate, endDate);

        // Count by severity with date range
        Long criticalCount = complaintRepository.countByDealerIdAndSeverityAndDateRange(dealerId, ComplaintSeverity.CRITICAL, startDate, endDate);
        Long highCount = complaintRepository.countByDealerIdAndSeverityAndDateRange(dealerId, ComplaintSeverity.HIGH, startDate, endDate);
        Long mediumCount = complaintRepository.countByDealerIdAndSeverityAndDateRange(dealerId, ComplaintSeverity.MEDIUM, startDate, endDate);
        Long lowCount = complaintRepository.countByDealerIdAndSeverityAndDateRange(dealerId, ComplaintSeverity.LOW, startDate, endDate);

        // Count by type with date range
        Map<String, Long> byType = complaintRepository.countByComplaintTypeAndDateRange(dealerId, startDate, endDate).stream()
                .collect(Collectors.toMap(
                    obj -> obj[0].toString(),
                    obj -> ((Number) obj[1]).longValue()
                ));

        // Count by staff with date range
        Map<String, Long> byStaff = complaintRepository.countByAssignedStaffAndDateRange(dealerId, startDate, endDate).stream()
                .collect(Collectors.toMap(
                    obj -> obj[0].toString(),
                    obj -> ((Number) obj[1]).longValue()
                ));

        // Average times with date range
        Double avgResolutionTime = complaintRepository.getAverageResolutionTimeWithDateRange(dealerId, ComplaintStatus.RESOLVED, startDate, endDate);
        Double avgFirstResponseTime = complaintRepository.getAverageFirstResponseTimeWithDateRange(dealerId, startDate, endDate);

        // Overdue complaints (SLA) with date range
        LocalDateTime criticalOverdueTime = LocalDateTime.now().minusHours(24);
        Long overdueCritical = complaintRepository.countOverdueComplaintsWithDateRange(dealerId, ComplaintSeverity.CRITICAL, criticalOverdueTime, startDate, endDate);
        Long overdueHigh = complaintRepository.countOverdueComplaintsWithDateRange(dealerId, ComplaintSeverity.HIGH, criticalOverdueTime, startDate, endDate);

        // Build byStatus map
        Map<String, Long> byStatus = Map.of(
            "NEW", newCount,
            "IN_PROGRESS", inProgressCount,
            "RESOLVED", resolvedCount,
            "CLOSED", closedCount
        );

        // Build bySeverity map
        Map<String, Long> bySeverity = Map.of(
            "CRITICAL", criticalCount,
            "HIGH", highCount,
            "MEDIUM", mediumCount,
            "LOW", lowCount
        );

        return ComplaintStatisticsResponse.builder()
                .totalComplaints(total)
                .newComplaints(newCount)
                .inProgressComplaints(inProgressCount)
                .resolvedComplaints(resolvedCount)
                .closedComplaints(closedCount)
                .byStatus(byStatus)
                .criticalComplaints(criticalCount)
                .highComplaints(highCount)
                .mediumComplaints(mediumCount)
                .lowComplaints(lowCount)
                .bySeverity(bySeverity)
                .byType(byType)
                .byStaff(byStaff)
                .averageResolutionTimeHours(avgResolutionTime != null ? avgResolutionTime : 0.0)
                .averageFirstResponseTimeHours(avgFirstResponseTime != null ? avgFirstResponseTime : 0.0)
                .overdueComplaints(overdueCritical + overdueHigh)
                .overdueCritical(overdueCritical)
                .overdueHigh(overdueHigh)
                .build();
    }

    // ============ Helper Methods ============

    private String generateComplaintCode() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%04d", new Random().nextInt(10000));
        return "FB-" + date + "-" + random;
    }

    private List<ComplaintResponse.ProgressUpdateInfo> parseProgressUpdates(String json) {
        if (json == null || json.isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<ComplaintResponse.ProgressUpdateInfo>>() {});
        } catch (JsonProcessingException e) {
            log.error("Error parsing progress updates", e);
            return new ArrayList<>();
        }
    }

    private String serializeProgressUpdates(List<ComplaintResponse.ProgressUpdateInfo> updates) {
        try {
            return objectMapper.writeValueAsString(updates);
        } catch (JsonProcessingException e) {
            log.error("Error serializing progress updates", e);
            return "[]";
        }
    }

    private ComplaintResponse mapToResponse(Complaint complaint) {
        return ComplaintResponse.builder()
                .complaintId(complaint.getComplaintId())
                .complaintCode(complaint.getComplaintCode())
                .customerId(complaint.getCustomer().getCustomerId())
                .customerName(complaint.getCustomerName())
                .customerPhone(complaint.getCustomerPhone())
                .customerEmail(complaint.getCustomerEmail())
                .dealerId(complaint.getDealerId())
                .orderId(complaint.getOrderId())
                .complaintType(complaint.getComplaintType())
                .complaintTypeDisplay(complaint.getComplaintType().getDisplayName())
                .severity(complaint.getSeverity())
                .severityDisplay(complaint.getSeverity().getDisplayName())
                .channel(complaint.getChannel())
                .channelDisplay(complaint.getChannel() != null ? complaint.getChannel().getDisplayName() : null)
                .description(complaint.getDescription())
                .status(complaint.getStatus())
                .statusDisplay(complaint.getStatus().getDisplayName())
                .assignedStaffId(complaint.getAssignedStaffId())
                .assignedStaffName(complaint.getAssignedStaffName())
                .internalNotes(complaint.getInternalNotes())
                .progressHistory(parseProgressUpdates(complaint.getProgressUpdates()))
                .internalResolution(complaint.getInternalResolution())
                .customerMessage(complaint.getCustomerMessage())
                .resolution(complaint.getResolution())
                .resolvedDate(complaint.getResolvedDate())
                .firstResponseAt(complaint.getFirstResponseAt())
                .notificationSent(complaint.getNotificationSent())
                .notificationSentAt(complaint.getNotificationSentAt())
                .createdByStaffId(complaint.getCreatedByStaffId())
                .createdByStaffName(complaint.getCreatedByStaffName())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }

    private void sendNotificationToStaff(Complaint complaint, String message) {
        try {
            NotificationRequest notification = NotificationRequest.builder()
                    .recipientName(complaint.getAssignedStaffName())
                    .subject("Phân công xử lý phản hồi")
                    .message(message)
                    .notificationType("EMAIL")
                    .build();

            // TODO: Send notification via Kafka when configured
            // kafkaTemplate.send("notification-topic", notification);
            log.info("TODO: Send notification to staff {} - {}", complaint.getAssignedStaffId(), message);
        } catch (Exception e) {
            log.error("Error sending notification to staff", e);
        }
    }

    /**
     * Gửi thông báo kết quả xử lý đến khách hàng
     * Public method để Staff có thể gọi thủ công
     */
    public ComplaintResponse sendNotificationToCustomer(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        // Kiểm tra complaint đã có customer message chưa (check both new and old field for backward compatibility)
        boolean hasMessage = (complaint.getCustomerMessage() != null && !complaint.getCustomerMessage().isEmpty()) ||
                            (complaint.getResolution() != null && !complaint.getResolution().isEmpty());
        if (!hasMessage) {
            throw new RuntimeException("Chưa có kết quả xử lý. Vui lòng cập nhật kết quả trước khi gửi thông báo.");
        }

        // Gửi notification
        sendResolutionNotificationToCustomer(complaint);

        log.info("Notification sent manually for complaint {}", complaintId);
        return mapToResponse(complaint);
    }

    private void sendResolutionNotificationToCustomer(Complaint complaint) {
        try {
            // Build HTML email content
            String htmlContent = buildResolutionEmailHtml(complaint);

            // Send email using JavaMailSender
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = 
                new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(complaint.getCustomerEmail());
            helper.setSubject("Kết quả xử lý phản hồi - " + complaint.getComplaintCode());
            helper.setText(htmlContent, true); // true = HTML
            
            // Optionally set from address (if configured in application.properties)
            // helper.setFrom("noreply@evdealer.com");

            mailSender.send(message);

            // Update notification sent flag
            complaint.setNotificationSent(true);
            complaint.setNotificationSentAt(LocalDateTime.now());
            complaintRepository.save(complaint);

            log.info("✅ Email notification sent to customer {} for complaint {}", 
                     complaint.getCustomerEmail(), complaint.getComplaintCode());

            // TODO: Send SMS if phone number is available
            if (complaint.getCustomerPhone() != null && !complaint.getCustomerPhone().isEmpty()) {
                log.info("TODO: Send SMS to {} (SMS service not yet configured)", complaint.getCustomerPhone());
            }

        } catch (Exception e) {
            log.error("❌ Failed to send resolution notification to customer {}", complaint.getCustomerEmail(), e);
            throw new RuntimeException("Không thể gửi email. Vui lòng kiểm tra cấu hình email hoặc thử lại sau.", e);
        }
    }

    /**
     * Build HTML template for resolution notification email
     */
    private String buildResolutionEmailHtml(Complaint complaint) {
        String customerName = complaint.getCustomerName();
        String complaintCode = complaint.getComplaintCode();
        
        // Use customerMessage for email (customer-facing), fallback to resolution for backward compatibility
        String customerMessage = complaint.getCustomerMessage() != null && !complaint.getCustomerMessage().isEmpty()
            ? complaint.getCustomerMessage()
            : (complaint.getResolution() != null ? complaint.getResolution() : "Đã xử lý xong");
        
        String description = complaint.getDescription() != null && !complaint.getDescription().isEmpty()
            ? complaint.getDescription()
            : "Không có mô tả";
        String staffName = complaint.getAssignedStaffName() != null 
            ? complaint.getAssignedStaffName() 
            : "Nhân viên hỗ trợ";
        
        // Format dates
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String createdDate = complaint.getCreatedAt().format(formatter);
        String resolvedDate = complaint.getResolvedDate() != null 
            ? complaint.getResolvedDate().format(formatter) 
            : LocalDateTime.now().format(formatter);

        // Get type and severity display names
        String typeDisplay = complaint.getComplaintType() != null 
            ? complaint.getComplaintType().getDisplayName() 
            : "Phản hồi";
        String severityDisplay = complaint.getSeverity() != null 
            ? complaint.getSeverity().getDisplayName() 
            : "";

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f5f5f5;
                    }
                    .container {
                        background: white;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #10b981 0%%, #059669 100%%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .content {
                        padding: 30px;
                    }
                    .success-badge {
                        background: #d1fae5;
                        color: #065f46;
                        padding: 15px 20px;
                        border-radius: 8px;
                        border-left: 4px solid #10b981;
                        margin: 20px 0;
                        font-weight: 500;
                    }
                    .info-box {
                        background: #f9fafb;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                        border: 1px solid #e5e7eb;
                    }
                    .info-row {
                        padding: 10px 0;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .info-row:last-child {
                        border-bottom: none;
                    }
                    .label {
                        font-weight: 600;
                        color: #6b7280;
                        display: inline-block;
                        width: 130px;
                    }
                    .value {
                        color: #111827;
                    }
                    .resolution-box {
                        background: #ecfdf5;
                        border: 2px solid #10b981;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 25px 0;
                    }
                    .resolution-box h3 {
                        color: #065f46;
                        margin: 0 0 15px 0;
                        font-size: 18px;
                    }
                    .resolution-text {
                        color: #064e3b;
                        line-height: 1.8;
                        white-space: pre-wrap;
                    }
                    .footer {
                        background: #f9fafb;
                        padding: 20px 30px;
                        text-align: center;
                        font-size: 13px;
                        color: #6b7280;
                        border-top: 1px solid #e5e7eb;
                    }
                    .footer-contact {
                        margin: 10px 0;
                        color: #374151;
                    }
                    .divider {
                        height: 1px;
                        background: #e5e7eb;
                        margin: 25px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1> Phản Hồi Đã Được Xử Lý</h1>
                    </div>
                    
                    <div class="content">
                        <p style="font-size: 16px; margin-bottom: 10px;">Kính gửi <strong>%s</strong>,</p>
                        
                        <div class="success-badge">
                            🎉 Phản hồi của bạn đã được xử lý thành công!
                        </div>
                        
                        <p>Chúng tôi xin thông báo rằng phản hồi của bạn đã được nhân viên của chúng tôi xem xét và giải quyết.</p>
                        
                        <div class="info-box">
                            <h3 style="margin-top: 0; color: #111827; font-size: 16px;">📋 Thông tin phản hồi</h3>
                            <div class="info-row">
                                <span class="label">Mã phản hồi:</span>
                                <span class="value"><strong>%s</strong></span>
                            </div>
                            <div class="info-row">
                                <span class="label">Loại:</span>
                                <span class="value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label" style="vertical-align: top;">Nội dung:</span>
                                <span class="value" style="display: inline-block; margin-top: 0; color: #374151; max-width: 400px; white-space: pre-wrap; word-wrap: break-word;">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Mức độ:</span>
                                <span class="value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Ngày tạo:</span>
                                <span class="value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Ngày giải quyết:</span>
                                <span class="value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Người xử lý:</span>
                                <span class="value">%s</span>
                            </div>
                        </div>
                        
                        <div style="margin: 25px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
                            <p style="color: #111827; line-height: 1.8; white-space: pre-wrap; margin: 0;">%s</p>
                        </div>
                        
                        <div class="divider"></div>
                        
                        <p style="font-size: 14px; color: #6b7280; margin: 20px 0;">
                            <strong>Lưu ý:</strong> Nếu bạn có bất kỳ thắc mắc nào hoặc cần hỗ trợ thêm, 
                            vui lòng liên hệ với chúng tôi qua các kênh bên dưới.
                        </p>
                        
                        <p style="margin-top: 25px; color: #111827;">
                            Trân trọng,<br>
                            <strong>%s</strong><br>
                            <span style="color: #6b7280;">EV Dealer Platform</span>
                        </p>
                    </div>
                    
                    <div class="footer">
                        <div class="footer-contact">
                            <strong>EV Dealer Management Platform</strong>
                        </div>
                        <div style="margin: 8px 0;">
                            📞 Hotline: 1900-xxxx | 📧 Email: support@evdealer.com
                        </div>
                        <div style="color: #9ca3af; font-size: 12px; margin-top: 10px;">
                            Email này được gửi tự động từ hệ thống. Vui lòng không trả lời email này.
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """,
            customerName,
            complaintCode,
            typeDisplay,
            description,
            severityDisplay,
            createdDate,
            resolvedDate,
            staffName,
            customerMessage,
            staffName
        );
    }
}
