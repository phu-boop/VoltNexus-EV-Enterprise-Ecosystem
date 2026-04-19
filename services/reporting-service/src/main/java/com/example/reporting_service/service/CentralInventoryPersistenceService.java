package com.example.reporting_service.service;

import com.example.reporting_service.model.CentralInventorySummary;
import com.example.reporting_service.model.CentralInventoryTransactionLog;
import com.example.reporting_service.repository.CentralInventorySummaryRepository;
import com.example.reporting_service.repository.CentralInventoryTransactionLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class CentralInventoryPersistenceService {

    private final CentralInventorySummaryRepository summaryRepo;
    private final CentralInventoryTransactionLogRepository logRepo;

    /**
     * Xử lý event RESTOCK hoặc INITIAL_STOCK: Tăng tồn kho trung tâm
     */
    @Transactional
    public void handleRestock(Long variantId, String variantName, Long modelId, String modelName,
                              int quantity, String staffId, String notes, String referenceId,
                              LocalDateTime transactionDate) {

        // 1. Cập nhật bảng tổng hợp
        CentralInventorySummary summary = getOrCreateSummary(variantId, variantName, modelId, modelName);
        summary.setTotalImported(summary.getTotalImported() + quantity);
        summary.setAvailableStock(summary.getTotalImported() - summary.getTotalTransferred());
        summary.setLastUpdatedAt(Timestamp.from(Instant.now()));
        summaryRepo.save(summary);

        // 2. Ghi log
        saveTransactionLog(variantId, variantName, modelId, modelName,
                "RESTOCK", quantity, null, null, staffId, referenceId, notes, transactionDate);

        log.info("-> Đã cập nhật RESTOCK: variant={}, qty={}, availableStock={}",
                variantId, quantity, summary.getAvailableStock());
    }

    /**
     * Xử lý event ALLOCATE: Ghi nhận phân bổ (Xem như Đã điều phối/Xuất kho theo yêu cầu User)
     * "2 cái đó là 1 mà" -> Gộp ALLOCATE vào logic của TRANSFER_TO_DEALER
     */
    @Transactional
    public void handleAllocate(Long variantId, String variantName, Long modelId, String modelName,
                               int quantity, String staffId, String notes, String referenceId,
                               LocalDateTime transactionDate) {

        CentralInventorySummary summary = getOrCreateSummary(variantId, variantName, modelId, modelName);
        
        // Cũ: summary.setTotalAllocated(summary.getTotalAllocated() + quantity);
        // Mới: Cộng vào TotalTransferred và Trừ AvailableStock
        summary.setTotalTransferred(summary.getTotalTransferred() + quantity);
        summary.setAvailableStock(summary.getTotalImported() - summary.getTotalTransferred());
        
        summary.setLastUpdatedAt(Timestamp.from(Instant.now()));
        summaryRepo.save(summary);

        saveTransactionLog(variantId, variantName, modelId, modelName,
                "ALLOCATE", quantity, null, null, staffId, referenceId, notes, transactionDate);

        log.info("-> Đã cập nhật ALLOCATE (tính là Dispatched): variant={}, qty={}, totalTransferred={}, availableStock={}",
                variantId, quantity, summary.getTotalTransferred(), summary.getAvailableStock());
    }

    /**
     * Xử lý event TRANSFER_TO_DEALER: Giảm tồn kho trung tâm
     */
    @Transactional
    public void handleTransferToDealer(Long variantId, String variantName, Long modelId, String modelName,
                                       int quantity, String toDealerId, String staffId, String notes,
                                       String referenceId, LocalDateTime transactionDate) {

        CentralInventorySummary summary = getOrCreateSummary(variantId, variantName, modelId, modelName);
        summary.setTotalTransferred(summary.getTotalTransferred() + quantity);
        summary.setAvailableStock(summary.getTotalImported() - summary.getTotalTransferred());
        summary.setLastUpdatedAt(Timestamp.from(Instant.now()));
        summaryRepo.save(summary);

        saveTransactionLog(variantId, variantName, modelId, modelName,
                "TRANSFER_TO_DEALER", quantity, null, toDealerId, staffId, referenceId, notes, transactionDate);

        log.info("-> Đã cập nhật TRANSFER_TO_DEALER: variant={}, qty={}, availableStock={}",
                variantId, quantity, summary.getAvailableStock());
    }

    /**
     * Xử lý các event khác (ADJUSTMENT_ADD, ADJUSTMENT_SUBTRACT, RETURN_FROM_DEALER, etc.)
     */
    @Transactional
    public void handleOtherTransaction(Long variantId, String variantName, Long modelId, String modelName,
                                       String transactionType, int quantity, String fromDealerId, String toDealerId,
                                       String staffId, String notes, String referenceId,
                                       LocalDateTime transactionDate) {

        // Chỉ ghi log, không thay đổi summary
        saveTransactionLog(variantId, variantName, modelId, modelName,
                transactionType, quantity, fromDealerId, toDealerId, staffId, referenceId, notes, transactionDate);

        log.info("-> Đã ghi log transaction: type={}, variant={}, qty={}", transactionType, variantId, quantity);
    }

    // ========== HELPER METHODS ==========

    private CentralInventorySummary getOrCreateSummary(Long variantId, String variantName,
                                                        Long modelId, String modelName) {
        return summaryRepo.findByVariantId(variantId).orElseGet(() -> {
            CentralInventorySummary newSummary = new CentralInventorySummary();
            newSummary.setVariantId(variantId);
            newSummary.setVariantName(variantName);
            newSummary.setModelId(modelId);
            newSummary.setModelName(modelName);
            newSummary.setTotalImported(0L);
            newSummary.setTotalAllocated(0L);
            newSummary.setTotalTransferred(0L);
            newSummary.setAvailableStock(0L);
            return newSummary;
        });
    }

    private void saveTransactionLog(Long variantId, String variantName, Long modelId, String modelName,
                                     String transactionType, int quantity, String fromDealerId, String toDealerId,
                                     String staffId, String referenceId, String notes,
                                     LocalDateTime transactionDate) {
        CentralInventoryTransactionLog logEntry = new CentralInventoryTransactionLog();
        logEntry.setVariantId(variantId);
        logEntry.setVariantName(variantName);
        logEntry.setModelId(modelId);
        logEntry.setModelName(modelName);
        logEntry.setTransactionType(transactionType);
        logEntry.setQuantity(quantity);
        logEntry.setFromDealerId(fromDealerId);
        logEntry.setToDealerId(toDealerId);
        logEntry.setStaffId(staffId);
        logEntry.setReferenceId(referenceId);
        logEntry.setNotes(notes);
        logEntry.setTransactionDate(transactionDate != null ? transactionDate : LocalDateTime.now());
        logEntry.setReceivedAt(LocalDateTime.now());
        logRepo.save(logEntry);
    }
}
