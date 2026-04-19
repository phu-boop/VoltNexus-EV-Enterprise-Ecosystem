package com.ev.payment_service.mapper;

import com.ev.payment_service.dto.response.DealerDebtSummaryResponse;
import com.ev.payment_service.dto.response.DealerInvoiceResponse;
import com.ev.payment_service.dto.response.DealerTransactionResponse;
import com.ev.payment_service.entity.DealerDebtRecord;
import com.ev.payment_service.entity.DealerInvoice;
import com.ev.payment_service.entity.DealerTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface DealerPaymentMapper {
    
    @Mapping(target = "remainingAmount", expression = "java(calculateRemainingAmount(invoice))")
    @Mapping(target = "transactions", ignore = true) // Sẽ set sau trong service
    DealerInvoiceResponse toInvoiceResponse(DealerInvoice invoice);
    
    @Mapping(source = "paymentMethod.methodName", target = "paymentMethodName")
    @Mapping(source = "dealerInvoice.dealerInvoiceId", target = "dealerInvoiceId")
    DealerTransactionResponse toTransactionResponse(DealerTransaction transaction);
    
    DealerDebtSummaryResponse toDebtSummaryResponse(DealerDebtRecord record);
    
    List<DealerTransactionResponse> toTransactionResponseList(List<DealerTransaction> transactions);
    
    // Helper method để tính remainingAmount
    default BigDecimal calculateRemainingAmount(DealerInvoice invoice) {
        if (invoice == null || invoice.getTotalAmount() == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal amountPaid = invoice.getAmountPaid() != null ? invoice.getAmountPaid() : BigDecimal.ZERO;
        return invoice.getTotalAmount().subtract(amountPaid);
    }
}

