package com.ev.sales_service.service.Interface;

import com.ev.sales_service.dto.request.*;
import com.ev.sales_service.dto.response.CustomerResponseRequest;
import com.ev.sales_service.dto.response.PromotionResponse;
import com.ev.sales_service.dto.response.QuotationResponse;
import com.ev.sales_service.dto.response.SalesOrderB2CResponse;
import com.ev.sales_service.entity.Promotion;
import com.ev.sales_service.entity.Quotation;
import com.ev.sales_service.enums.QuotationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable; // ✅ đúng
import org.springframework.data.domain.Page; // nếu dùng Page

import java.util.List;
import java.util.UUID;

public interface QuotationService {

    // Bước 1: Tạo báo giá dự thảo
    QuotationResponse createDraftQuotation(QuotationCreateRequest request);

    // Bước 2: Tính toán giá với khuyến mãi
    QuotationResponse calculateQuotationPrice(UUID quotationId, QuotationCalculateRequest request);

    // Bước 3: Gửi báo giá cho khách hàng
    QuotationResponse sendQuotationToCustomer(UUID quotationId, QuotationSendRequest request);

    // Bước 4: Xử lý phản hồi khách hàng
    QuotationResponse handleCustomerResponse(UUID quotationId, CustomerResponseRequest request);

    // Bước 5: Chuyển đổi thành đơn hàng
    SalesOrderB2CResponse convertToSalesOrderB2C(UUID quotationId);

    // Quản lý và tìm kiếm
    QuotationResponse getQuotationById(UUID quotationId);


    void expireOldQuotations();


    void deleteQuotation(UUID quotationId);

    QuotationFilterRequest buildFilterRequestForStaff(UUID staffId, String status, String customer,
                                                      String dateFrom, String dateTo, String search);

    QuotationFilterRequest buildFilterRequestForDealer(UUID dealerId, String status, String customer,
                                                       String dateFrom, String dateTo, String search);

    List<QuotationResponse> getQuotationsByFilters(QuotationFilterRequest filterRequest);

}