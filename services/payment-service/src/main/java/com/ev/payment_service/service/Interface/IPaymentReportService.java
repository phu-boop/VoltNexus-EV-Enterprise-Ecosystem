package com.ev.payment_service.service.Interface;

import com.ev.payment_service.dto.response.DealerRevenueResponse;
import com.ev.payment_service.dto.response.CustomerDebtSummaryResponse;
import com.ev.payment_service.dto.response.DealerDebtAgingResponse;

import java.time.LocalDate;
import java.util.List;

/**
 * Payment Report Service Interface
 */
public interface IPaymentReportService {

    /**
     * Lấy doanh thu theo đại lý
     * @param startDate Ngày bắt đầu
     * @param endDate Ngày kết thúc
     * @return Danh sách doanh thu theo đại lý
     */
    List<DealerRevenueResponse> getRevenueByDealer(LocalDate startDate, LocalDate endDate);

    /**
     * Lấy tổng hợp công nợ khách hàng
     * @return Danh sách tổng hợp công nợ khách hàng
     */
    List<CustomerDebtSummaryResponse> getCustomerDebtSummary();

    /**
     * Lấy báo cáo công nợ đại lý theo độ tuổi (aging)
     * @return Danh sách công nợ đại lý theo độ tuổi
     */
    List<DealerDebtAgingResponse> getDealerDebtAging();
}


