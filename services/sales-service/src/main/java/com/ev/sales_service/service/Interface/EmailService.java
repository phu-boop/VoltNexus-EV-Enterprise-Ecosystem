package com.ev.sales_service.service.Interface;

import com.ev.sales_service.dto.response.CustomerResponse;
import com.ev.sales_service.entity.Quotation;
import com.ev.sales_service.entity.SalesOrder;

public interface EmailService {
    void sendQuotationEmail(Quotation quotation, CustomerResponse customer);

    void sendQuotationAcceptedEmail(Quotation quotation, CustomerResponse customer);

    void sendQuotationRejectedEmail(Quotation quotation, CustomerResponse customer);

    void sendOrderConfirmedEmail(SalesOrder salesOrder, CustomerResponse customer, String showroomName);
}
