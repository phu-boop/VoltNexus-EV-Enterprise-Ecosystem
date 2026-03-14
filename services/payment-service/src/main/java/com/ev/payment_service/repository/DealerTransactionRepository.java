package com.ev.payment_service.repository;

import com.ev.payment_service.entity.DealerTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.UUID;

public interface DealerTransactionRepository extends JpaRepository<DealerTransaction, UUID> {

    // Lấy tất cả giao dịch của một hóa đơn
    List<DealerTransaction> findByDealerInvoice_DealerInvoiceId(UUID dealerInvoiceId);

        // Lấy tất cả giao dịch chờ duyệt (bao gồm cả tiền mặt, VNPAY, ...)
        @Query("SELECT dt FROM DealerTransaction dt " +
            "WHERE dt.status = 'PENDING_CONFIRMATION' " +
            "ORDER BY dt.transactionDate DESC")
        Page<DealerTransaction> findPendingTransactions(Pageable pageable);
}