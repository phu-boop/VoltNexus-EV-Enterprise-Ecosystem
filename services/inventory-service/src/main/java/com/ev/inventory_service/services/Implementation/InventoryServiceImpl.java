package com.ev.inventory_service.services.Implementation;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.common_lib.model.enums.*;
import com.ev.common_lib.dto.inventory.VinValidationResultDto;
import com.ev.common_lib.dto.inventory.AllocationRequestDto;
import com.ev.common_lib.dto.inventory.ShipmentRequestDto;
import com.ev.common_lib.dto.inventory.InventoryComparisonDto;
import com.ev.common_lib.dto.vehicle.VariantDetailDto;
import com.ev.common_lib.event.StockAlertEvent;

import com.ev.inventory_service.dto.request.TransactionRequestDto;
import com.ev.inventory_service.dto.request.UpdateReorderLevelRequest;
import com.ev.inventory_service.dto.request.CreateTransferRequestDto;
import com.ev.inventory_service.dto.response.DealerInventoryDto;
import com.ev.inventory_service.model.PhysicalVehicle;
import com.ev.inventory_service.model.Enum.VehiclePhysicalStatus;
// import com.ev.inventory_service.dto.response.DealerInventoryDto;
// import com.ev.inventory_service.dto.response.DealerInventoryDto
// Sự kiện Kafka
import com.ev.common_lib.event.DealerStockUpdatedEvent;

import com.ev.inventory_service.dto.response.InventoryStatusDto;
import com.ev.inventory_service.model.CentralInventory;
import com.ev.inventory_service.model.DealerAllocation;
import com.ev.inventory_service.model.InventoryTransaction;
import com.ev.inventory_service.model.TransferRequest;
import com.ev.inventory_service.model.StockAlert;
import com.ev.inventory_service.model.Enum.TransferRequestStatus;
import com.ev.inventory_service.repository.CentralInventoryRepository;
import com.ev.inventory_service.repository.DealerAllocationRepository;
import com.ev.inventory_service.repository.InventoryTransactionRepository;
import com.ev.inventory_service.repository.PhysicalVehicleRepository;
import com.ev.inventory_service.repository.StockAlertRepository;
import com.ev.inventory_service.repository.TransferRequestRepository;
import com.ev.inventory_service.services.Interface.InventoryService;
import com.ev.inventory_service.specification.InventorySpecification;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
// Redis for cache
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

// import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.beans.factory.annotation.Value;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.ss.usermodel.*;

import java.io.ByteArrayOutputStream;
import java.util.Optional;
import java.io.OutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Collections;
import java.util.ArrayList;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.sql.Timestamp;
import java.time.Instant;
// import java.lang.RuntimeException;
//PDF Lib
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartUtils;
import org.jfree.chart.JFreeChart;
import org.jfree.data.general.DefaultPieDataset;
import com.itextpdf.layout.element.Image;
import com.itextpdf.io.image.ImageDataFactory;
import java.io.InputStream;
// import java.awt.BasicStroke;
import org.jfree.chart.labels.StandardPieSectionLabelGenerator;
import org.jfree.chart.plot.PiePlot;
import java.awt.Color;
// Log
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.kafka.core.KafkaTemplate;

import lombok.RequiredArgsConstructor;
import java.util.UUID;
import java.text.DecimalFormat;

@Service
@RequiredArgsConstructor // Tự động inject dependency qua constructor
public class InventoryServiceImpl implements InventoryService {

    private final CentralInventoryRepository centralRepo;
    private final DealerAllocationRepository dealerRepo;
    private final InventoryTransactionRepository transactionRepo;
    private final RestTemplate restTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final PhysicalVehicleRepository physicalVehicleRepo;
    private final TransferRequestRepository transferRequestRepo;

    private final StockAlertRepository stockAlertRepo;
    private static final Logger log = LoggerFactory.getLogger(InventoryServiceImpl.class);

    public static final String TOPIC_DEALER_STOCK_UPDATED = "stock_events_dealerEVM";
    public static final String TOPIC_LOW_STOCK_ALERT = "inventory.alerts.low_stock";

    @Value("${app.services.catalog.url}")
    private String vehicleCatalogUrl;

    @Override
    @Cacheable(value = "inventory-status", key = "#variantId")
    public InventoryStatusDto getInventoryStatusForVariant(Long variantId) {
        // Chỉ lấy dữ liệu từ kho trung tâm
        CentralInventory central = centralRepo.findByVariantId(variantId)
                .orElse(null); // Trả về null nếu chưa có bản ghi tồn kho

        // Nếu không có bản ghi tồn kho nào, trả về DTO rỗng
        if (central == null) {
            return InventoryStatusDto.builder()
                    .variantId(variantId)
                    .totalQuantity(0)
                    .allocatedQuantity(0)
                    .availableQuantity(0)
                    .reorderLevel(0)
                    .status(InventoryLevelStatus.OUT_OF_STOCK)
                    .build();
        }

        // Tính toán trạng thái chỉ dựa trên kho trung tâm
        int available = central.getAvailableQuantity();
        int reorder = central.getReorderLevel() != null ? central.getReorderLevel() : 0;

        InventoryLevelStatus currentStatus;
        if (available <= 0) {
            currentStatus = InventoryLevelStatus.OUT_OF_STOCK;
        } else if (available <= reorder) {
            currentStatus = InventoryLevelStatus.LOW_STOCK;
        } else {
            currentStatus = InventoryLevelStatus.IN_STOCK;
        }

        // 3. Xây dựng DTO chỉ với thông tin kho trung tâm
        return InventoryStatusDto.builder()
                .variantId(variantId)
                .totalQuantity(central.getTotalQuantity())
                .allocatedQuantity(central.getAllocatedQuantity())
                .availableQuantity(central.getAvailableQuantity())
                .reorderLevel(central.getReorderLevel())
                .status(currentStatus)
                .build();
    }

    @Override
    public Page<InventoryStatusDto> getAllInventory(
            String search,
            UUID dealerId,
            String status,
            Pageable pageable) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getDetails() instanceof Map<?, ?> detailsMap) {
            String userId = (String) detailsMap.get("userId");
            String profileId = (String) detailsMap.get("profileId");

        }

        List<Specification<CentralInventory>> specs = new ArrayList<>();

        // --- LOGIC TÌM KIẾM THEO TÊN XE ---
        if (search != null && !search.isBlank()) {
            // Gọi API của vehicle-catalog-service để lấy danh sách variantId
            String searchUrl = vehicleCatalogUrl + "/vehicle-catalog/variants/search?keyword=" + search; // Cổng của
                                                                                                         // vehicle-catalog-service

            ResponseEntity<ApiRespond<List<Long>>> response = restTemplate.exchange(
                    searchUrl,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<ApiRespond<List<Long>>>() {
                    });

            List<Long> variantIds = response.getBody().getData();

            // Thêm điều kiện tìm kiếm vào Specification
            if (variantIds != null && !variantIds.isEmpty()) {
                specs.add(InventorySpecification.hasVariantIdIn(variantIds));
            } else {
                // Nếu tìm kiếm không ra kết quả nào, trả về trang rỗng
                return Page.empty(pageable);
            }
        }

        // --- LOGIC LỌC THEO ĐẠI LÝ ---
        if (dealerId != null) {
            // Từ dealerId, tìm ra danh sách các variantId mà đại lý đó có hàng
            List<Long> variantIdsForDealer = dealerRepo.findByDealerId(dealerId).stream()
                    .map(DealerAllocation::getVariantId)
                    .distinct()
                    .collect(Collectors.toList());

            // Nếu đại lý không có xe nào thì trả về trang rỗng
            if (variantIdsForDealer.isEmpty()) {
                return Page.empty(pageable);
            }

            // Thêm điều kiện "variantId phải nằm trong danh sách trên" vào Specification
            specs.add(InventorySpecification.hasVariantIdIn(variantIdsForDealer));
        }

        Specification<CentralInventory> finalSpec = specs.stream().reduce(Specification::and).orElse(null);
        Page<CentralInventory> inventoryPage = centralRepo.findAll(finalSpec, pageable);

        return inventoryPage.map(item -> getInventoryStatusForVariant(item.getVariantId()));
    }

    @Override
    @Transactional
    public void executeTransaction(TransactionRequestDto request, String staffEmail, String role, String profileId) {

        // Chỉ xử lý RESTOCK ở đây
        if (request.getTransactionType() != TransactionType.RESTOCK) {
            throw new IllegalArgumentException("Invalid transaction type for this endpoint.");
        }

        // Kiểm tra quyền
        if (!role.equals("EVM_STAFF") && !role.equals("ADMIN")) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // Xử lý logic nhập kho bằng VIN
        handleRestock(request);

        // Ghi log giao dịch
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setVariantId(request.getVariantId());
        transaction.setTransactionType(TransactionType.RESTOCK);
        transaction.setQuantity(request.getVins().size()); // Lấy số lượng từ VINs
        transaction.setStaffId(staffEmail);
        transaction.setNotes(request.getNotes());
        InventoryTransaction savedTransaction = transactionRepo.save(transaction);

        // Gửi sự kiện Kafka
        try {
            kafkaTemplate.send("inventory_events", savedTransaction);
        } catch (Exception e) {
            System.err.println("WARN: Failed to send inventory event to Kafka. " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void createTransferRequest(CreateTransferRequestDto request) {
        // Kiểm tra kho
        CentralInventory central = centralRepo.findByVariantId(request.getVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

        if (central.getAvailableQuantity() < request.getQuantity()) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
        }

        // Tạo yêu cầu mới
        TransferRequest newRequest = new TransferRequest();
        newRequest.setVariantId(request.getVariantId());
        newRequest.setQuantity(request.getQuantity());
        newRequest.setToDealerId(request.getToDealerId());
        newRequest.setRequesterEmail(request.getRequesterEmail());
        newRequest.setNotes(request.getNotes());
        newRequest.setStatus(TransferRequestStatus.PENDING); // Trạng thái "Chờ duyệt"

        transferRequestRepo.save(newRequest);
    }

    @Override
    public void generateInventoryReport(OutputStream outputStream, LocalDate startDate, LocalDate endDate)
            throws IOException {

        // 1. Lấy tất cả các giao dịch trong khoảng thời gian đã chọn
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
        List<InventoryTransaction> transactions = transactionRepo.findAllByTransactionDateBetween(startDateTime,
                endDateTime);

        // 2. Dùng Apache POI để tạo file Excel từ danh sách giao dịch
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Báo cáo giao dịch kho");

            // --- Tạo Header ---
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = createHeaderStyle(workbook);
            String[] columns = { "ID Giao Dịch", "Ngày", "Loại Giao Dịch", "ID Sản Phẩm", "Số Lượng", "Từ Kho",
                    "Đến Kho", "Nhân Viên", "Ghi Chú" };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // --- Đổ dữ liệu ---
            int rowNum = 1;
            for (InventoryTransaction tx : transactions) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(tx.getTransactionId());
                row.createCell(1).setCellValue(tx.getTransactionDate().toString());
                row.createCell(2).setCellValue(tx.getTransactionType().name());
                row.createCell(3).setCellValue(tx.getVariantId());
                row.createCell(4).setCellValue(tx.getQuantity());
                row.createCell(5).setCellValue(
                        tx.getFromDealerId() != null ? "Đại lý " + tx.getFromDealerId() : "Kho Trung Tâm");
                row.createCell(6)
                        .setCellValue(tx.getToDealerId() != null ? "Đại lý " + tx.getToDealerId() : "Kho Trung Tâm");
                row.createCell(7).setCellValue(tx.getStaffId());
                row.createCell(8).setCellValue(tx.getNotes());
            }

            // Tự động điều chỉnh độ rộng cột
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
        }
    }

    @Override
    public void generatePdfReport(OutputStream outputStream, LocalDate startDate, LocalDate endDate)
            throws IOException {
        // Lấy dữ liệu giao dịch
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
        List<InventoryTransaction> transactions = transactionRepo.findAllByTransactionDateBetween(startDateTime,
                endDateTime);

        // Dùng iText để tạo file PDF
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // --- Font ---
        PdfFont vietnameseFont = PdfFontFactory.createFont("fonts/DejaVuSans.ttf", PdfEncodings.IDENTITY_H, pdf);
        document.setFont(vietnameseFont);

        try (InputStream logoStream = getClass().getClassLoader().getResourceAsStream("images/logo.png")) {
            if (logoStream != null) {
                byte[] logoBytes = logoStream.readAllBytes();
                Image logo = new Image(ImageDataFactory.create(logoBytes));
                logo.setWidth(100); // Set kích thước cố định cho logo
                logo.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.RIGHT); // Căn phải
                document.add(logo);
            }
        } catch (Exception e) {
            log.warn("Không thể tải logo: {}", e.getMessage());
        }

        // --- Thêm Tiêu đề ---
        document.add(new Paragraph("Báo Cáo Giao Dịch Kho").setBold().setFontSize(16));
        document.add(new Paragraph("Từ Ngày: " + startDate + " Đến Ngày: " + endDate));
        document.add(new Paragraph(" "));

        if (!transactions.isEmpty()) {
            byte[] chartImageBytes = createChartImage(transactions);
            if (chartImageBytes != null) {
                try {
                    // Tạo đối tượng Image của iText từ byte[]
                    Image chartImage = new Image(ImageDataFactory.create(chartImageBytes));

                    // Căn giữa biểu đồ và set chiều rộng
                    chartImage.setWidth(UnitValue.createPercentValue(80)); // Rộng 80% trang
                    chartImage.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER);

                    document.add(chartImage); // Thêm biểu đồ vào tài liệu
                    document.add(new Paragraph(" ")); // Thêm khoảng trắng
                } catch (Exception e) {
                    log.warn("Không thể chèn biểu đồ vào PDF: {}", e.getMessage());
                }
            }
        }

        // --- Tạo Bảng ---
        float[] columnWidths = { 1, 3, 2, 2, 1, 3, 3, 2, 4 };
        Table table = new Table(UnitValue.createPercentArray(columnWidths));
        table.setWidth(UnitValue.createPercentValue(100));
        table.setFontSize(9);

        // --- Thêm Header cho Bảng ---
        String[] headers = { "ID", "Ngày", "Loại GD", "Variant ID", "SL", "Từ Kho", "Đến Kho", "Nhân Viên", "Ghi Chú" };
        for (String header : headers) {

            table.addHeaderCell(new Paragraph(header).setBold().setFontSize(13));
        }

        // --- Đổ dữ liệu vào Bảng ---
        if (transactions.isEmpty()) {
            document.add(new Paragraph("Không có giao dịch nào trong khoảng thời gian đã chọn."));
        } else {
            for (InventoryTransaction tx : transactions) {

                table.addCell(String.valueOf(tx.getTransactionId()));
                table.addCell(tx.getTransactionDate().toLocalDate().toString());
                table.addCell(getTransactionTypeName(tx.getTransactionType()));
                table.addCell(String.valueOf(tx.getVariantId()));
                table.addCell(String.valueOf(tx.getQuantity()));
                table.addCell(tx.getFromDealerId() != null ? "Đại Lý " + tx.getFromDealerId() : "Kho TT");
                table.addCell(tx.getToDealerId() != null ? "Đại Lý " + tx.getToDealerId() : "Kho TT");
                table.addCell(tx.getStaffId());
                table.addCell(tx.getNotes() != null ? tx.getNotes() : "");
            }
            document.add(table);
        }

        document.close();
    }

    @Override
    @Transactional
    public void updateDealerReorderLevel(UUID dealerId, UpdateReorderLevelRequest request) {
        // Tìm bản ghi phân bổ tương ứng với đại lý và sản phẩm
        DealerAllocation allocation = dealerRepo.findByVariantIdAndDealerId(request.getVariantId(), dealerId)
                .orElseThrow(() -> new AppException(ErrorCode.ALLOCATION_NOT_FOUND));

        // Cập nhật lại ngưỡng cảnh báo
        allocation.setReorderLevel(request.getReorderLevel());

        // Lưu thay đổi
        dealerRepo.save(allocation);
    }

    @Override
    @Transactional
    public void updateCentralReorderLevel(UpdateReorderLevelRequest request, String updatedByEmail) {
        CentralInventory inventory = centralRepo.findByVariantId(request.getVariantId())
                .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

        // saveCentralInventoryHistory(inventory, EVMAction.UPDATE, updatedByEmail);

        inventory.setReorderLevel(request.getReorderLevel());

        centralRepo.save(inventory);

        checkStockThresholdAndNotify(request.getVariantId());
    }

    @Override
    public Page<InventoryTransaction> getTransactionHistory(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        // Luôn sắp xếp theo ngày mới nhất lên đầu
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by("transactionDate").descending());

        // Nếu người dùng cung cấp cả ngày bắt đầu và kết thúc
        if (startDate != null && endDate != null) {
            LocalDateTime startDateTime = startDate.atStartOfDay();
            LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
            return transactionRepo.findAllByTransactionDateBetween(startDateTime, endDateTime, sortedPageable);
        } else {
            // Nếu không, trả về tất cả lịch sử (có phân trang)
            return transactionRepo.findAll(sortedPageable);
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = "inventory-status", allEntries = true)
    public void allocateStockForOrder(AllocationRequestDto request, String staffEmail) {
        for (AllocationRequestDto.AllocationItem item : request.getItems()) {
            CentralInventory central = centralRepo.findByVariantId(item.getVariantId())
                    .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

            if (central.getAvailableQuantity() < item.getQuantity()) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }

            central.setAvailableQuantity(central.getAvailableQuantity() - item.getQuantity());
            central.setAllocatedQuantity(central.getAllocatedQuantity() + item.getQuantity());
            centralRepo.save(central);

            // Ghi log giao dịch "ALLOCATE"
            InventoryTransaction tx = new InventoryTransaction();
            tx.setTransactionType(TransactionType.ALLOCATE);
            tx.setVariantId(item.getVariantId());
            tx.setQuantity(item.getQuantity());
            tx.setStaffId(staffEmail);
            tx.setReferenceId(request.getOrderId().toString());
            InventoryTransaction savedAllocateTx = transactionRepo.save(tx);

            // Gửi sự kiện Kafka cho ALLOCATE
            try {
                kafkaTemplate.send("inventory_events", savedAllocateTx);
            } catch (Exception e) {
                System.err.println("WARN: Failed to send ALLOCATE event to Kafka. " + e.getMessage());
            }
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = "inventory-status", allEntries = true) // Xóa cache khi giao hàng
    public void shipAllocatedStock(ShipmentRequestDto request, String staffEmail) {
        UUID dealerId = request.getDealerId();
        UUID orderId = request.getOrderId();

        for (ShipmentRequestDto.ShipmentItem item : request.getItems()) {
            Long variantId = item.getVariantId();
            List<String> vins = item.getVins();
            int quantity = vins.size();

            // Cập nhật bảng SKU (kho trung tâm)
            CentralInventory central = centralRepo.findByVariantId(variantId)
                    .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

            if (central.getAllocatedQuantity() < quantity) {
                System.err.println("Lỗi phân bổ: Không đủ hàng đã giữ.");
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK);
            }
            central.setAllocatedQuantity(central.getAllocatedQuantity() - quantity);
            central.setTotalQuantity(central.getTotalQuantity() - quantity);
            centralRepo.save(central);

            checkStockThresholdAndNotify(variantId);

            // Cập nhật bảng SKU (kho đại lý)
            DealerAllocation allocation = dealerRepo.findByVariantIdAndDealerId(variantId, dealerId)
                    .orElseGet(() -> {
                        DealerAllocation newAlloc = new DealerAllocation();
                        newAlloc.setVariantId(variantId);
                        newAlloc.setDealerId(dealerId);
                        newAlloc.setAllocatedQuantity(0);
                        newAlloc.setAvailableQuantity(0);
                        return newAlloc; //
                    });

            allocation.setAvailableQuantity(allocation.getAvailableQuantity() + quantity);
            DealerAllocation savedAllocation = dealerRepo.save(allocation);

            try {
                DealerStockUpdatedEvent event = DealerStockUpdatedEvent.builder()
                        // Lấy từ dữ liệu "làm giàu" (Bước 2)
                        .variantId(item.getVariantId())
                        .variantName(item.getVariantName())
                        .modelId(item.getModelId())
                        .modelName(item.getModelName())

                        // Lấy từ dữ liệu vừa save
                        .dealerId(savedAllocation.getDealerId())
                        .newAvailableQuantity(savedAllocation.getAvailableQuantity())
                        .newAllocatedQuantity(savedAllocation.getAllocatedQuantity())

                        // Thêm thời gian
                        .lastUpdatedAt(Timestamp.from(Instant.now()))
                        .build();

                // Gửi sự kiện lên Topic
                kafkaTemplate.send(TOPIC_DEALER_STOCK_UPDATED, event);

            } catch (Exception e) {
                // Chỉ log lỗi, không dừng transaction
                System.err.println("WARN: Gửi sự kiện Kafka thất bại (dealer stock updated): " + e.getMessage());
            }

            // Cập nhật bảng VIN (xe vật lý)
            List<PhysicalVehicle> vehicles = physicalVehicleRepo.findAllById(vins);
            for (PhysicalVehicle vehicle : vehicles) {
                if (vehicle.getStatus() != VehiclePhysicalStatus.IN_CENTRAL_WAREHOUSE) {
                    System.err.println("Xe " + vehicle.getVin() + " không ở kho trung tâm.");
                    throw new AppException(ErrorCode.BAD_REQUEST);
                }
                vehicle.setStatus(VehiclePhysicalStatus.AT_DEALER); // Cập nhật trạng thái
                vehicle.setLocationId(dealerId); // Cập nhật vị trí
                vehicle.setOrderId(orderId);
            }
            physicalVehicleRepo.saveAll(vehicles);

            // Ghi log giao dịch
            InventoryTransaction tx = new InventoryTransaction();
            tx.setTransactionType(TransactionType.TRANSFER_TO_DEALER);
            tx.setVariantId(variantId);
            tx.setQuantity(quantity);
            tx.setToDealerId(dealerId);
            tx.setStaffId(staffEmail);
            tx.setReferenceId(request.getOrderId().toString());
            tx.setNotes("Đã giao các VIN: " + String.join(", ", vins));
            InventoryTransaction savedTransferTx = transactionRepo.save(tx);

            // Gửi sự kiện Kafka cho TRANSFER_TO_DEALER
            try {
                kafkaTemplate.send("inventory_events", savedTransferTx);
            } catch (Exception e) {
                System.err.println("WARN: Failed to send TRANSFER_TO_DEALER event to Kafka. " + e.getMessage());
            }
        }
    }

    /**
     * Lấy trạng thái tồn kho cho NHIỀU variant
     */
    @Override
    @Transactional(readOnly = true)
    public List<InventoryStatusDto> getInventoryStatusByIds(List<Long> variantIds) {
        if (variantIds == null || variantIds.isEmpty()) {
            return Collections.emptyList();
        }

        // Tải TỒN KHO TRUNG TÂM (1 query duy nhất)
        List<CentralInventory> inventories = centralRepo.findByVariantIdIn(variantIds);
        // Tạo Map để tra cứu nhanh
        Map<Long, CentralInventory> inventoryMap = inventories.stream()
                .collect(Collectors.toMap(CentralInventory::getVariantId, inv -> inv));

        // Map kết quả (Dùng stream() của variantIds gốc để đảm bảo trả về đủ)
        return variantIds.stream()
                .map(id -> {
                    // Lấy thông tin từ Map đã tra cứu
                    CentralInventory inventory = inventoryMap.get(id);

                    // Gọi hàm helper đã sửa (chỉ 2 tham số)
                    return mapToInventoryStatusDto(inventory, id);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryComparisonDto> getDetailedInventoryByIds(List<Long> variantIds, UUID dealerId) {
        if (variantIds == null || variantIds.isEmpty()) {
            return Collections.emptyList();
        }

        Map<Long, CentralInventory> centralMap = centralRepo.findByVariantIdIn(variantIds).stream()
                .collect(Collectors.toMap(CentralInventory::getVariantId, inv -> inv));

        // (Bạn cần thêm phương thức findByVariantIdInAndDealerId vào
        // DealerAllocationRepository)
        Map<Long, DealerAllocation> dealerMap = dealerRepo.findByVariantIdInAndDealerId(variantIds, dealerId).stream()
                .collect(Collectors.toMap(DealerAllocation::getVariantId, alloc -> alloc));

        return variantIds.stream()
                .map(id -> {
                    CentralInventory central = centralMap.get(id);
                    DealerAllocation dealer = dealerMap.get(id);

                    InventoryComparisonDto dto = new InventoryComparisonDto();
                    dto.setVariantId(id);

                    // Lấy tồn kho trung tâm
                    int centralStock = (central != null) ? central.getAvailableQuantity() : 0;
                    dto.setCentralStockAvailable(centralStock);

                    // Lấy tồn kho đại lý
                    int dealerStock = (dealer != null) ? dealer.getAvailableQuantity() : 0;
                    dto.setDealerStockAvailable(dealerStock);

                    // Xác định trạng thái chung (ưu tiên tồn kho đại lý, sau đó đến kho hãng)
                    if (dealerStock > 0) {
                        dto.setStatus(InventoryLevelStatus.IN_STOCK);
                    } else if (centralStock > 0) {
                        dto.setStatus(InventoryLevelStatus.IN_STOCK);
                    } else {
                        dto.setStatus(InventoryLevelStatus.OUT_OF_STOCK);
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true) // Quan trọng: Đây là thao tác chỉ đọc
    public VinValidationResultDto validateVinsForShipment(List<String> vins) {

        List<String> validVinsList = new ArrayList<>();
        Map<String, String> invalidVinsMap = new java.util.HashMap<>();

        // Tìm tất cả VINs trong DB (chỉ 1 query)
        List<PhysicalVehicle> foundVehicles = physicalVehicleRepo.findAllById(vins);

        // Chuyển sang Map để tra cứu nhanh
        Map<String, PhysicalVehicle> vehicleMap = foundVehicles.stream()
                .collect(Collectors.toMap(PhysicalVehicle::getVin, v -> v));

        // Lặp qua danh sách VINs mà user nhập để kiểm tra
        for (String vin : vins) {
            if (!vehicleMap.containsKey(vin)) {
                // Không tìm thấy VIN
                invalidVinsMap.put(vin, "Không tìm thấy VIN trong kho.");
            } else {
                PhysicalVehicle vehicle = vehicleMap.get(vin);

                // VIN có trạng thái không phù hợp
                if (vehicle.getStatus() != VehiclePhysicalStatus.IN_CENTRAL_WAREHOUSE) {
                    invalidVinsMap.put(vin, "Xe không ở kho trung tâm (Trạng thái: " +
                            getVehicleStatusMessage(vehicle.getStatus()) + ").");
                } else {
                    // Hợp lệ!
                    validVinsList.add(vin);
                }
            }
        }

        return VinValidationResultDto.builder()
                .invalidVins(invalidVinsMap)
                .validVins(validVinsList)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getVariantIdsByStatus(String status) {
        // Chuyển đổi chuỗi sang Enum
        InventoryLevelStatus statusEnum;
        try {
            statusEnum = InventoryLevelStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Collections.emptyList(); // Trả về rỗng nếu status không hợp lệ
        }

        // Lấy TẤT CẢ ID xe từ Vehicle-Service (Danh sách "Chủ")
        List<Long> allVariantIds = getAllVariantIdsFromCatalog();

        // Lấy TẤT CẢ bản ghi kho (Dữ liệu "Phụ")
        Map<Long, CentralInventory> stockMap = centralRepo.findAll().stream()
                .collect(Collectors.toMap(CentralInventory::getVariantId, stock -> stock));

        // Lọc danh sách "Chủ" dựa trên dữ liệu "Phụ"
        return allVariantIds.stream()
                .filter(variantId -> {
                    CentralInventory stock = stockMap.get(variantId);

                    InventoryLevelStatus currentStatus;

                    if (stock == null) {
                        // Nếu xe không có trong kho, nó là OUT_OF_STOCK
                        currentStatus = InventoryLevelStatus.OUT_OF_STOCK;
                    } else {
                        // Nếu có trong kho, tính toán trạng thái
                        int available = stock.getAvailableQuantity();
                        int reorder = (stock.getReorderLevel() != null) ? stock.getReorderLevel() : 0;

                        if (available <= 0)
                            currentStatus = InventoryLevelStatus.OUT_OF_STOCK;
                        else if (available <= reorder)
                            currentStatus = InventoryLevelStatus.LOW_STOCK;
                        else
                            currentStatus = InventoryLevelStatus.IN_STOCK;
                    }

                    // Trả về true nếu trạng thái tính toán khớp với trạng thái đang lọc
                    return currentStatus == statusEnum;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAvailableVinsForVariant(Long variantId) {
        // Tìm tất cả xe có variantId này
        // VÀ đang ở trạng thái sẵn sàng tại kho trung tâm
        List<PhysicalVehicle> vehicles = physicalVehicleRepo.findByVariantIdAndStatus(
                variantId,
                VehiclePhysicalStatus.IN_CENTRAL_WAREHOUSE);

        // Trả về danh sách VINs
        return vehicles.stream()
                .map(PhysicalVehicle::getVin)
                .collect(Collectors.toList());
    }

    // ==========================================================
    // ===== LOGIC NGHIỆP VỤ MỚI CHO VIỆC TRẢ HÀNG =====
    // ==========================================================

    @Override
    @Transactional
    @CacheEvict(value = "inventory-status", allEntries = true) // Xóa cache khi trả hàng
    public void returnStockForOrder(UUID orderId, String staffEmail) {

        // Tìm tất cả các xe (vehicle) đã bị gán cho đơn hàng này
        // (Đây là các xe đã bị giao hoặc đang vận chuyển)
        List<PhysicalVehicle> vehiclesToReturn = physicalVehicleRepo.findAllByOrderId(orderId);

        if (vehiclesToReturn.isEmpty()) {
            // (Idempotent) Có thể đơn hàng đã được trả, hoặc chưa bao giờ được giao
            System.err.println("Không tìm thấy xe nào để trả về kho cho Order ID: " + orderId);
            return;
        }


        // Phân nhóm các xe theo VariantId (ví dụ: 2 xe Variant 1, 1 xe Variant 2)
        Map<Long, Long> variantCounts = vehiclesToReturn.stream()
                .collect(Collectors.groupingBy(PhysicalVehicle::getVariantId, Collectors.counting()));

        // Lặp qua từng nhóm xe để trả về kho
        for (Map.Entry<Long, Long> entry : variantCounts.entrySet()) {
            Long variantId = entry.getKey();
            int quantityToReturn = entry.getValue().intValue();

            // Tìm kho trung tâm của variant này
            CentralInventory stock = centralRepo.findByVariantId(variantId)
                    .orElseThrow(() -> new AppException(ErrorCode.INVENTORY_NOT_FOUND));

            // Cập nhật số lượng kho (Logic ngược của allocate + ship)
            // (shipAllocatedStock đã trừ total-- và allocated--)
            // (allocateStockForOrder đã trừ available-- và cộng allocated++)
            // -> Trả hàng (ngược lại của cả 2) sẽ là: total++ và available++

            stock.setTotalQuantity(stock.getTotalQuantity() + quantityToReturn);
            stock.setAvailableQuantity(stock.getAvailableQuantity() + quantityToReturn);

            centralRepo.save(stock);

            checkStockThresholdAndNotify(variantId);

            // Ghi lại giao dịch (Transaction)
            InventoryTransaction transaction = new InventoryTransaction();
            transaction.setVariantId(variantId);
            transaction.setQuantity(quantityToReturn);
            transaction.setTransactionType(TransactionType.RETURN_FROM_DEALER);
            transaction.setNotes("Trả hàng khiếu nại từ Order ID: " + orderId);
            transaction.setStaffId(staffEmail);
            transaction.setReferenceId(orderId.toString());
            transactionRepo.save(transaction);
        }

        // Cập nhật lại trạng thái của từng xe
        for (PhysicalVehicle vehicle : vehiclesToReturn) {
            vehicle.setStatus(VehiclePhysicalStatus.IN_CENTRAL_WAREHOUSE);
            vehicle.setLocationId(null);
            vehicle.setOrderId(null);
        }
        physicalVehicleRepo.saveAll(vehiclesToReturn);
    }

    // --Helper methods--
    private void handleRestock(TransactionRequestDto request) {

        if (request.getVins() == null || request.getVins().isEmpty()) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        int quantity = request.getVins().size();

        // Lưu từng chiếc xe vật lý vào bảng VIN
        List<PhysicalVehicle> newVehicles = new ArrayList<>();
        for (String vin : request.getVins()) {
            if (physicalVehicleRepo.existsById(vin)) {
                throw new AppException(ErrorCode.DATA_ALREADY_EXISTS);
            }

            PhysicalVehicle vehicle = new PhysicalVehicle();
            vehicle.setVin(vin);
            vehicle.setVariantId(request.getVariantId());
            vehicle.setStatus(VehiclePhysicalStatus.IN_CENTRAL_WAREHOUSE);
            vehicle.setLocationId(null); // null = Kho trung tâm
            newVehicles.add(vehicle);
        }
        physicalVehicleRepo.saveAll(newVehicles);

        // Cập nhật bảng tóm tắt (CentralInventory)
        CentralInventory inventory = centralRepo.findByVariantId(request.getVariantId())
                .orElseGet(() -> {
                    CentralInventory newInv = new CentralInventory();
                    newInv.setVariantId(request.getVariantId());
                    newInv.setTotalQuantity(0);
                    newInv.setAllocatedQuantity(0);
                    newInv.setAvailableQuantity(0);
                    return newInv;
                });

        inventory.setTotalQuantity(inventory.getTotalQuantity() + quantity);
        inventory.setAvailableQuantity(inventory.getAvailableQuantity() + quantity);
        centralRepo.save(inventory);

        checkStockThresholdAndNotify(request.getVariantId());
    }

    /**
     * Map thủ công từ Entity sang DTO.
     * Xử lý cả trường hợp 'inventory' (kho TT) là null (khi xe chưa được nhập kho).
     */
    private InventoryStatusDto mapToInventoryStatusDto(CentralInventory inventory, Long variantId) {

        // 1. Dùng Builder() thay vì new InventoryStatusDto()
        InventoryStatusDto.InventoryStatusDtoBuilder dtoBuilder = InventoryStatusDto.builder();
        dtoBuilder.variantId(variantId);

        if (inventory == null) {
            // Trường hợp xe này CHƯA CÓ trong kho trung tâm
            dtoBuilder.availableQuantity(0);
            dtoBuilder.allocatedQuantity(0);
            dtoBuilder.totalQuantity(0);
            dtoBuilder.reorderLevel(0); // Ngưỡng mặc định
            dtoBuilder.status(InventoryLevelStatus.OUT_OF_STOCK);
        } else {
            // Trường hợp xe ĐÃ CÓ trong kho trung tâm
            // 1. Lấy reorderLevel và kiểm tra null, gán mặc định là 0
            int reorderLvl = (inventory.getReorderLevel() != null) ? inventory.getReorderLevel() : 0;

            dtoBuilder.availableQuantity(inventory.getAvailableQuantity());
            dtoBuilder.allocatedQuantity(inventory.getAllocatedQuantity());
            dtoBuilder.totalQuantity(inventory.getTotalQuantity());

            // 2. Dùng giá trị đã kiểm tra null
            dtoBuilder.reorderLevel(reorderLvl);

            // Logic xác định trạng thái (Dùng Enum)
            if (inventory.getAvailableQuantity() <= 0) {
                dtoBuilder.status(InventoryLevelStatus.OUT_OF_STOCK);
            } else if (inventory.getAvailableQuantity() <= reorderLvl) { // 3. Dùng giá trị đã kiểm tra null
                dtoBuilder.status(InventoryLevelStatus.LOW_STOCK);
            } else {
                dtoBuilder.status(InventoryLevelStatus.IN_STOCK);
            }
        }

        return dtoBuilder.build(); // Trả về DTO đã được build
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    /**
     * Lấy tồn kho của Đại lý và gộp với thông tin chi tiết từ Vehicle-Service.
     */
    @Override
    public List<DealerInventoryDto> getDealerInventory(UUID dealerId, String search, HttpHeaders headers) {

        // Lấy tất cả tồn kho (SKU) của Đại lý này
        List<DealerAllocation> dealerStock = dealerRepo.findByDealerId(dealerId);

        // Lấy tất cả ID sản phẩm mà đại lý này có
        List<Long> variantIds = dealerStock.stream()
                .map(DealerAllocation::getVariantId)
                .collect(Collectors.toList());

        // Nếu đại lý không có xe nào, trả về danh sách rỗng
        if (variantIds.isEmpty()) {
            return new ArrayList<>();
        }

        String url = vehicleCatalogUrl + "/vehicle-catalog/variants/details-by-ids";
        HttpEntity<List<Long>> requestEntity = new HttpEntity<>(variantIds, headers);

        ResponseEntity<ApiRespond<List<VariantDetailDto>>> response;
        try {
            response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<ApiRespond<List<VariantDetailDto>>>() {
                    });
        } catch (Exception e) {
            System.err.println("Failed to call vehicle-service /details-by-ids: " + e.getMessage());
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }

        if (response.getBody() == null || response.getBody().getData() == null) {
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }

        // Map<VariantID, ThôngTinChiTiếtXe>
        Map<Long, VariantDetailDto> variantDetailsMap = response.getBody().getData().stream()
                .collect(Collectors.toMap(VariantDetailDto::getVariantId, v -> v));

        // Map<VariantID, ThôngTinKho>
        Map<Long, DealerAllocation> inventoryMap = dealerStock.stream()
                .collect(Collectors.toMap(DealerAllocation::getVariantId, s -> s));

        // Gộp dữ liệu và Lọc (nếu có)
        List<DealerInventoryDto> mergedList = variantIds.stream()
                .map(id -> {
                    VariantDetailDto details = variantDetailsMap.get(id);
                    DealerAllocation stock = inventoryMap.get(id);
                    return DealerInventoryDto.merge(details, stock);
                })
                .filter(dto -> dto != null) // Bỏ qua các variant null (không tìm thấy từ catalog)
                .filter(dto -> { // Lọc client-side (vì số lượng ít)
                    if (search == null || search.isBlank())
                        return true;
                    String query = search.toLowerCase();
                    return (dto.getModelName() != null && dto.getModelName().toLowerCase().contains(query)) ||
                            (dto.getVersionName() != null && dto.getVersionName().toLowerCase().contains(query)) ||
                            (dto.getColor() != null && dto.getColor().toLowerCase().contains(query)) ||
                            (dto.getSkuCode() != null && dto.getSkuCode().toLowerCase().contains(query));
                })
                .collect(Collectors.toList());

        return mergedList;
    }

    /**
     * Hàm Helper để trả về thông báo lỗi thân thiện
     */
    private String getVehicleStatusMessage(VehiclePhysicalStatus status) {
        switch (status) {
            case AT_DEALER:
                return "Đã ở kho đại lý";
            case SOLD:
                return "Đã bán cho khách hàng";
            case IN_TRANSIT:
                return "Đang vận chuyển";
            case IN_CENTRAL_WAREHOUSE:
                return "Sẵn sàng (Kho trung tâm)";
            default:
                return status.name();
        }
    }

    /**
     * Gọi sang vehicle-service
     */
    private List<Long> getAllVariantIdsFromCatalog() {
        String catalogUrl = vehicleCatalogUrl + "/vehicle-catalog/variants/all-ids";

        try {
            ResponseEntity<ApiRespond<List<Long>>> response = restTemplate.exchange(
                    catalogUrl,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<ApiRespond<List<Long>>>() {
                    });

            if (response.getBody() != null && response.getBody().getData() != null) {
                return response.getBody().getData();
            }
        } catch (Exception e) {
            System.err.println("Không thể lấy all-ids từ vehicle-service: " + e.getMessage());
        }
        return Collections.emptyList();
    }

    /**
     * Kiểm tra ngưỡng tồn kho và gửi/giải quyết cảnh báo.
     * Đây là logic cốt lõi cho yêu cầu "cảnh báo 1 lần".
     */
    @Transactional
    private void checkStockThresholdAndNotify(Long variantId) {
        try {
            CentralInventory inventory = centralRepo.findByVariantId(variantId).orElse(null);
            if (inventory == null)
                return;

            int currentStock = inventory.getAvailableQuantity();
            int reorderLevel = (inventory.getReorderLevel() != null) ? inventory.getReorderLevel() : 0;
            Optional<StockAlert> existingAlert = stockAlertRepo.findFirstByVariantIdAndStatus(variantId, "NEW");

            if (currentStock <= reorderLevel && currentStock > 0) {
                // ---- TRƯỜNG HỢP 1: DƯỚI NGƯỠNG (LOW_STOCK) ----

                if (existingAlert.isEmpty()) {
                    // Tạo cảnh báo mới
                    StockAlert newAlert = new StockAlert();
                    newAlert.setVariantId(variantId);
                    newAlert.setAlertType("LOW_STOCK_CENTRAL");
                    newAlert.setCurrentStock(currentStock);
                    newAlert.setThreshold(reorderLevel);
                    newAlert.setStatus("NEW");

                    StockAlert savedAlert = stockAlertRepo.save(newAlert);

                    log.info("Đang làm giàu (enriching) sự kiện low-stock...");
                    VariantDetailDto details = callCatalogService(variantId);

                    // 3. (THAY ĐỔI) Map Entity sang Event DTO với dữ liệu mới
                    StockAlertEvent eventPayload = StockAlertEvent.builder()
                            .alertId(savedAlert.getAlertId())
                            .variantId(savedAlert.getVariantId())
                            .alertType(savedAlert.getAlertType())
                            .currentStock(savedAlert.getCurrentStock())
                            .threshold(savedAlert.getThreshold())
                            .alertDate(savedAlert.getAlertDate())
                            .variantName(details.getVersionName()) // Giả sử bạn dùng VersionName
                            .skuCode(details.getSkuCode())
                            .build();
                    // Gửi sự kiện Kafka
                    try {
                        kafkaTemplate.send(TOPIC_LOW_STOCK_ALERT, eventPayload);
                    } catch (Exception e) {
                        log.warn("WARN: Gửi sự kiện Kafka (LOW_STOCK_ALERT) thất bại. {}", e.getMessage());
                    }

                }
                // Nếu existingAlert.isPresent() -> Đã cảnh báo rồi, không làm gì cả.

            } else {
                // ---- TRƯỜNG HỢP 2: TRÊN NGƯỠNG (STOCK_OK) ----
                if (existingAlert.isPresent()) {
                    StockAlert alertToResolve = existingAlert.get();
                    alertToResolve.setStatus("RESOLVED");
                    stockAlertRepo.save(alertToResolve);

                }
            }
        } catch (Exception e) {
            log.error("CRITICAL ERROR: Lỗi trong lúc checkStockThresholdAndNotify: {}", e.getMessage(), e);
        }
    }

    /**
     * Hàm helper gọi sang catalog-service để lấy chi tiết xe
     */
    private VariantDetailDto callCatalogService(Long variantId) {
        String url = vehicleCatalogUrl + "/vehicle-catalog/variants/" + variantId;
        try {
            ResponseEntity<ApiRespond<VariantDetailDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<ApiRespond<VariantDetailDto>>() {
                    });

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null
                    || response.getBody().getData() == null) {
                log.warn("Không thể lấy chi tiết variant {} từ catalog-service, response: {}", variantId,
                        response.getStatusCode());
                throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
            }
            return response.getBody().getData();

        } catch (Exception e) {
            log.error("Lỗi khi gọi catalog-service cho variant {}: {}", variantId, e.getMessage());
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }
    }

    // --- Helped cho báo cáo ---
    /**
     * Tạo hình ảnh biểu đồ tròn (Pie Chart) từ dữ liệu giao dịch.
     * 
     * @param transactions Danh sách giao dịch
     * @return Mảng byte[] của hình ảnh PNG
     */
    private byte[] createChartImage(List<InventoryTransaction> transactions) {
        try {
            // Tổng hợp dữ liệu: Đếm số lượng giao dịch theo từng loại
            Map<TransactionType, Long> data = transactions.stream()
                    .collect(Collectors.groupingBy(
                            InventoryTransaction::getTransactionType,
                            Collectors.counting()));

            // Tạo dataset cho biểu đồ tròn
            DefaultPieDataset<String> dataset = new DefaultPieDataset<>();
            for (Map.Entry<TransactionType, Long> entry : data.entrySet()) {
                String vietnameseName = getTransactionTypeName(entry.getKey());
                dataset.setValue(vietnameseName, entry.getValue());
            }

            // Tạo biểu đồ (Chart)
            JFreeChart pieChart = ChartFactory.createPieChart(
                    "Tỷ Lệ Các Loại Giao Dịch", // Tiêu đề biểu đồ
                    dataset,
                    true, // Hiển thị legend
                    true,
                    false);

            @SuppressWarnings("unchecked")
            PiePlot<String> plot = (PiePlot<String>) pieChart.getPlot();
            pieChart.setBackgroundPaint(Color.WHITE);
            plot.setBackgroundPaint(null);
            plot.setShadowPaint(null);

            Color[] colors = {
                    new Color(110, 190, 255), // Xanh dương
                    new Color(255, 159, 77), // Cam
                    new Color(113, 221, 105), // Xanh lá
                    new Color(255, 105, 132), // Đỏ/Hồng
                    new Color(179, 136, 255), // Tím
                    new Color(255, 219, 88), // Vàng
                    new Color(150, 150, 150) // Xám (cho các loại khác)
            };

            List<String> keys = dataset.getKeys();
            for (int i = 0; i < keys.size(); i++) {
                plot.setSectionPaint(keys.get(i), colors[i % colors.length]);
            }

            StandardPieSectionLabelGenerator labelGenerator = new StandardPieSectionLabelGenerator(
                    "{0} ({2})", // Định dạng
                    new DecimalFormat("0"), // Định dạng cho Giá trị (không dùng)
                    new DecimalFormat("0.0%") // Định dạng cho % (1 số lẻ)
            );
            // Gán trình tạo nhãn này cho biểu đồ
            plot.setLabelGenerator(labelGenerator);

            plot.setLabelBackgroundPaint(new Color(240, 240, 240));
            plot.setLabelOutlinePaint(null);
            plot.setLabelShadowPaint(null);

            // Xuất biểu đồ ra ByteArrayOutputStream (ảnh PNG)
            ByteArrayOutputStream chartOutputStream = new ByteArrayOutputStream();
            ChartUtils.writeChartAsPNG(
                    chartOutputStream,
                    pieChart,
                    500, // Chiều rộng (width)
                    300 // Chiều cao (height)
            );

            return chartOutputStream.toByteArray();

        } catch (Exception e) {
            log.error("Không thể tạo biểu đồ: {}", e.getMessage());
            return null; // Trả về null nếu có lỗi
        }
    }

    /**
     * Chuyển đổi TransactionType (enum) sang tên Tiếng Việt thân thiện.
     */
    private String getTransactionTypeName(TransactionType type) {
        if (type == null)
            return "Không rõ";

        switch (type) {
            case RESTOCK:
                return "Nhập kho TT"; // TT = Trung Tâm
            case ALLOCATE:
                return "Giữ hàng (cho đơn)";
            case TRANSFER_TO_DEALER:
                return "Chuyển cho Đại lý";
            case SALE:
                return "Bán hàng";
            case RETURN_FROM_DEALER:
                return "Đại lý trả hàng";
            case ADJUSTMENT_ADD:
                return "Kiểm kho (Tăng)";
            case ADJUSTMENT_SUBTRACT:
                return "Kiểm kho (Giảm)";
            case INITIAL_STOCK:
                return "Nhập kho lần đầu";
            case TRANSFER_TO_CENTRAL:
                return "Đại lý chuyển về TT";
            default:
                return type.name(); // Trả về tên gốc nếu chưa định nghĩa
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<DealerInventoryDto> getInventorySnapshotsForAnalytics(Long variantId, UUID dealerId, int limit) {
        try {
            // Tìm danh sách allocation từ DB dựa trên filter
            List<DealerAllocation> allocations;

            if (dealerId != null && variantId != null) {
                // Cả 2 điều kiện
                DealerAllocation allocation = dealerRepo.findByVariantIdAndDealerId(variantId, dealerId)
                        .orElse(null);
                allocations = (allocation != null) ? List.of(allocation) : Collections.emptyList();
            } else if (dealerId != null) {
                // Chỉ có dealerId
                allocations = dealerRepo.findByDealerId(dealerId);
            } else if (variantId != null) {
                // Chỉ có variantId
                allocations = dealerRepo.findByVariantId(variantId);
            } else {
                // Không có filter nào, lấy tất cả (giới hạn bằng limit)
                Pageable pageable = PageRequest.of(0, limit, Sort.by("lastUpdated").descending());
                allocations = dealerRepo.findAll(pageable).getContent();
            }

            // Giới hạn số lượng kết quả
            if (allocations.size() > limit) {
                allocations = allocations.subList(0, limit);
            }

            // Lấy danh sách variantId để gọi Vehicle Service
            List<Long> variantIds = allocations.stream()
                    .map(DealerAllocation::getVariantId)
                    .distinct()
                    .collect(Collectors.toList());

            if (variantIds.isEmpty()) {
                return Collections.emptyList();
            }

            // Gọi Vehicle Service để lấy thông tin chi tiết variant
            String url = vehicleCatalogUrl + "/vehicle-catalog/variants/details-by-ids";

            HttpEntity<List<Long>> requestEntity = new HttpEntity<>(variantIds);

            ResponseEntity<ApiRespond<List<VariantDetailDto>>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<ApiRespond<List<VariantDetailDto>>>() {
                    });

            List<VariantDetailDto> variantDetails = (response.getBody() != null && response.getBody().getData() != null)
                    ? response.getBody().getData()
                    : Collections.emptyList();

            // Map variantId -> VariantDetailDto
            Map<Long, VariantDetailDto> variantMap = variantDetails.stream()
                    .collect(Collectors.toMap(VariantDetailDto::getVariantId, v -> v));

            // Gộp dữ liệu từ allocations và variantDetails
            return allocations.stream()
                    .map(allocation -> {
                        VariantDetailDto variant = variantMap.get(allocation.getVariantId());
                        if (variant == null) {
                            // Nếu không tìm thấy variant, tạo DTO rỗng
                            return DealerInventoryDto.builder()
                                    .variantId(allocation.getVariantId())
                                    .modelName("Unknown")
                                    .versionName("Unknown")
                                    .color("Unknown")
                                    .skuCode("N/A")
                                    .availableQuantity(allocation.getAvailableQuantity())
                                    .allocatedQuantity(allocation.getAllocatedQuantity())
                                    .reorderLevel(allocation.getReorderLevel())
                                    .status(InventoryLevelStatus.OUT_OF_STOCK.name())
                                    .build();
                        }
                        return DealerInventoryDto.merge(variant, allocation);
                    })
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Lỗi khi lấy inventory snapshots cho analytics: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    // -----------
}
