package com.ev.payment_service.service.Interface;

import com.ev.payment_service.dto.request.CreateDealerInvoiceRequest;
import com.ev.payment_service.dto.request.PayDealerInvoiceRequest;
import com.ev.payment_service.dto.response.DealerDebtSummaryResponse;
import com.ev.payment_service.dto.response.DealerInvoiceResponse;
import com.ev.payment_service.dto.response.DealerTransactionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface IDealerPaymentService {
    
    /**
     * Tạo hóa đơn công nợ cho Đại lý (EVM Staff)
     */
    DealerInvoiceResponse createDealerInvoice(CreateDealerInvoiceRequest request, UUID staffId);
    
    /**
     * Đại lý thanh toán hóa đơn (Dealer Manager)
     */
    DealerTransactionResponse payDealerInvoice(UUID invoiceId, PayDealerInvoiceRequest request, UUID dealerId);
    
    /**
     * EVM Staff xác nhận thanh toán từ Đại lý
     */
    DealerTransactionResponse confirmDealerTransaction(UUID transactionId, UUID staffId, String notes);
    
    /**
     * Lấy danh sách hóa đơn của một Đại lý
     */
    Page<DealerInvoiceResponse> getDealerInvoices(UUID dealerId, String status, Pageable pageable);
    
    /**
     * Lấy chi tiết hóa đơn theo ID
     */
    DealerInvoiceResponse getDealerInvoiceById(UUID invoiceId);
    
    /**
     * Lấy tổng hợp công nợ của tất cả Đại lý (EVM Staff)
     */
    Page<DealerDebtSummaryResponse> getDealerDebtSummary(Pageable pageable);

    /**
     * Kiểm tra xem đơn hàng đã có hóa đơn chưa
     */
    boolean hasInvoiceForOrder(UUID orderId);

    /**
     * Lấy danh sách thanh toán tiền mặt chờ duyệt (EVM Staff)
     */
    Page<DealerTransactionResponse> getPendingCashPayments(Pageable pageable);
}

