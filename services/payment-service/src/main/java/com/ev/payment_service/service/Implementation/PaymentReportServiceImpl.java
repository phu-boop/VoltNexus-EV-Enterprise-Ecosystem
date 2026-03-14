package com.ev.payment_service.service.Implementation;

import com.ev.payment_service.dto.response.DealerRevenueResponse;
import com.ev.payment_service.dto.response.CustomerDebtSummaryResponse;
import com.ev.payment_service.dto.response.DealerDebtAgingResponse;
import com.ev.payment_service.entity.DealerInvoice;
import com.ev.payment_service.entity.DealerTransaction;
import com.ev.payment_service.entity.DealerDebtRecord;
import com.ev.payment_service.entity.PaymentRecord;
import com.ev.payment_service.repository.DealerInvoiceRepository;
import com.ev.payment_service.repository.DealerTransactionRepository;
import com.ev.payment_service.repository.DealerDebtRecordRepository;
import com.ev.payment_service.repository.PaymentRecordRepository;
import com.ev.payment_service.service.Interface.IPaymentReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Payment Report Service Implementation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentReportServiceImpl implements IPaymentReportService {

    private final DealerInvoiceRepository dealerInvoiceRepository;
    private final DealerTransactionRepository dealerTransactionRepository;
    private final DealerDebtRecordRepository dealerDebtRecordRepository;
    private final PaymentRecordRepository paymentRecordRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DealerRevenueResponse> getRevenueByDealer(LocalDate startDate, LocalDate endDate) {
        log.info("Getting revenue by dealer - StartDate: {}, EndDate: {}", startDate, endDate);

        // Lấy tất cả invoices trong khoảng thời gian
        List<DealerInvoice> invoices = dealerInvoiceRepository.findAll().stream()
                .filter(invoice -> {
                    LocalDate invoiceDate = invoice.getCreatedAt().toLocalDate();
                    return (invoiceDate.isAfter(startDate.minusDays(1)) || invoiceDate.isEqual(startDate)) &&
                           (invoiceDate.isBefore(endDate.plusDays(1)) || invoiceDate.isEqual(endDate));
                })
                .collect(Collectors.toList());

        // Group by dealerId
        Map<UUID, List<DealerInvoice>> invoicesByDealer = invoices.stream()
                .collect(Collectors.groupingBy(DealerInvoice::getDealerId));

        // Tính toán doanh thu cho mỗi dealer
        List<DealerRevenueResponse> revenueList = new ArrayList<>();
        for (Map.Entry<UUID, List<DealerInvoice>> entry : invoicesByDealer.entrySet()) {
            UUID dealerId = entry.getKey();
            List<DealerInvoice> dealerInvoices = entry.getValue();

            BigDecimal totalRevenue = dealerInvoices.stream()
                    .map(DealerInvoice::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalPaid = dealerInvoices.stream()
                    .map(DealerInvoice::getAmountPaid)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Lấy tổng số transactions
            List<DealerTransaction> transactions = dealerTransactionRepository.findAll().stream()
                    .filter(transaction -> dealerInvoices.stream()
                            .anyMatch(invoice -> invoice.getDealerInvoiceId().equals(transaction.getDealerInvoice().getDealerInvoiceId())))
                    .filter(transaction -> "SUCCESS".equals(transaction.getStatus()) || "CONFIRMED".equals(transaction.getStatus()))
                    .collect(Collectors.toList());

            DealerRevenueResponse response = DealerRevenueResponse.builder()
                    .dealerId(dealerId)
                    .dealerName("Dealer " + dealerId) // TODO: Lấy từ Dealer Service
                    .totalRevenue(totalRevenue)
                    .totalPaid(totalPaid)
                    .totalTransactions(transactions.size())
                    .totalInvoices(dealerInvoices.size())
                    .build();

            revenueList.add(response);
        }

        log.info("Found {} dealers with revenue data", revenueList.size());
        return revenueList;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerDebtSummaryResponse> getCustomerDebtSummary() {
        log.info("Getting customer debt summary");

        // Lấy tất cả payment records có công nợ (remainingAmount > 0)
        List<PaymentRecord> paymentRecords = paymentRecordRepository.findAll().stream()
                .filter(record -> record.getRemainingAmount().compareTo(BigDecimal.ZERO) > 0)
                .filter(record -> record.getCustomerId() != null)
                .collect(Collectors.toList());

        // 1. Group by customerId (Long)
        Map<Long, List<PaymentRecord>> recordsByCustomer = paymentRecords.stream()
                .collect(Collectors.groupingBy(PaymentRecord::getCustomerId));

        List<CustomerDebtSummaryResponse> debtList = new ArrayList<>();
        // 2. Process each customer
        for (Map.Entry<Long, List<PaymentRecord>> entry : recordsByCustomer.entrySet()) {
            Long customerId = entry.getKey();
            List<PaymentRecord> customerRecords = entry.getValue();

            BigDecimal totalDebt = customerRecords.stream()
                    .map(PaymentRecord::getRemainingAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal averageDebt = totalDebt.divide(
                    BigDecimal.valueOf(customerRecords.size()),
                    2,
                    java.math.RoundingMode.HALF_UP
            );

            CustomerDebtSummaryResponse response = CustomerDebtSummaryResponse.builder()
                    .customerId(customerId)
                    .customerName("Customer " + customerId) // TODO: Lấy từ Customer Service
                    .totalDebt(totalDebt)
                    .totalOrders(customerRecords.size())
                    .averageDebt(averageDebt)
                    .build();

            debtList.add(response);
        }

        log.info("Found {} customers with debt", debtList.size());
        return debtList;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DealerDebtAgingResponse> getDealerDebtAging() {
        log.info("Getting dealer debt aging");

        // Lấy tất cả debt records
        List<DealerDebtRecord> debtRecords = dealerDebtRecordRepository.findAll();

        // Lấy tất cả invoices chưa thanh toán đủ
        List<DealerInvoice> unpaidInvoices = dealerInvoiceRepository.findAll().stream()
                .filter(invoice -> !"PAID".equals(invoice.getStatus()))
                .collect(Collectors.toList());

        // Tính toán aging cho mỗi dealer
        List<DealerDebtAgingResponse> agingList = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (DealerDebtRecord debtRecord : debtRecords) {
            UUID dealerId = debtRecord.getDealerId();

            // Lấy invoices của dealer này
            List<DealerInvoice> dealerInvoices = unpaidInvoices.stream()
                    .filter(invoice -> invoice.getDealerId().equals(dealerId))
                    .collect(Collectors.toList());

            BigDecimal currentPeriod = BigDecimal.ZERO;
            BigDecimal period31to60 = BigDecimal.ZERO;
            BigDecimal period61to90 = BigDecimal.ZERO;
            BigDecimal over90Days = BigDecimal.ZERO;
            int overdueInvoices = 0;

            for (DealerInvoice invoice : dealerInvoices) {
                LocalDate dueDate = invoice.getDueDate();
                long daysOverdue = ChronoUnit.DAYS.between(dueDate, today);
                BigDecimal remainingAmount = invoice.getTotalAmount().subtract(invoice.getAmountPaid());

                if (daysOverdue < 0) {
                    // Chưa đến hạn
                    currentPeriod = currentPeriod.add(remainingAmount);
                } else if (daysOverdue <= 30) {
                    // 0-30 ngày quá hạn
                    currentPeriod = currentPeriod.add(remainingAmount);
                    overdueInvoices++;
                } else if (daysOverdue <= 60) {
                    // 31-60 ngày quá hạn
                    period31to60 = period31to60.add(remainingAmount);
                    overdueInvoices++;
                } else if (daysOverdue <= 90) {
                    // 61-90 ngày quá hạn
                    period61to90 = period61to90.add(remainingAmount);
                    overdueInvoices++;
                } else {
                    // Trên 90 ngày quá hạn
                    over90Days = over90Days.add(remainingAmount);
                    overdueInvoices++;
                }
            }

            DealerDebtAgingResponse response = DealerDebtAgingResponse.builder()
                    .dealerId(dealerId)
                    .dealerName("Dealer " + dealerId) // TODO: Lấy từ Dealer Service
                    .currentBalance(debtRecord.getCurrentBalance())
                    .currentPeriod(currentPeriod)
                    .period31to60(period31to60)
                    .period61to90(period61to90)
                    .over90Days(over90Days)
                    .totalInvoices(dealerInvoices.size())
                    .overdueInvoices(overdueInvoices)
                    .build();

            agingList.add(response);
        }

        log.info("Found {} dealers with debt aging data", agingList.size());
        return agingList;
    }
}

