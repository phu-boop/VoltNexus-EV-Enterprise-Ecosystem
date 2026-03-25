package com.ev.payment_service.service.Implementation;

import com.ev.payment_service.dto.request.CreateDealerInvoiceRequest;
import com.ev.payment_service.dto.response.DealerInvoiceResponse;
import com.ev.payment_service.entity.DealerInvoice;
import com.ev.payment_service.mapper.DealerPaymentMapper;
import com.ev.payment_service.repository.DealerDebtRecordRepository;
import com.ev.payment_service.repository.DealerInvoiceRepository;
import com.ev.payment_service.repository.DealerTransactionRepository;
import com.ev.payment_service.repository.PaymentMethodRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DealerPaymentServiceImplTest {

    @Mock
    private DealerInvoiceRepository dealerInvoiceRepository;

    @Mock
    private DealerTransactionRepository dealerTransactionRepository;

    @Mock
    private DealerDebtRecordRepository dealerDebtRecordRepository;

    @Mock
    private PaymentMethodRepository paymentMethodRepository;

    @Mock
    private DealerPaymentMapper dealerPaymentMapper;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private DealerPaymentServiceImpl dealerPaymentService;

    private CreateDealerInvoiceRequest request;
    private DealerInvoice invoice;
    private DealerInvoiceResponse response;

    @BeforeEach
    void setUp() {
        request = new CreateDealerInvoiceRequest();
        request.setDealerId(UUID.randomUUID());
        request.setAmount(new BigDecimal("1000000.00"));
        request.setOrderId(UUID.randomUUID());
        request.setDueDate(LocalDate.now().plusWeeks(1));
        request.setNotes("Test Invoice");

        invoice = new DealerInvoice();
        invoice.setDealerInvoiceId(UUID.randomUUID());
        invoice.setTotalAmount(request.getAmount());

        response = new DealerInvoiceResponse();
        response.setDealerInvoiceId(invoice.getDealerInvoiceId());
        response.setTotalAmount(invoice.getTotalAmount());
    }

    @Test
    void createDealerInvoice_ShouldSaveAndReturnResponse() {
        when(dealerInvoiceRepository.save(any(DealerInvoice.class))).thenReturn(invoice);
        when(dealerPaymentMapper.toInvoiceResponse(any(DealerInvoice.class))).thenReturn(response);

        DealerInvoiceResponse result = dealerPaymentService.createDealerInvoice(request, UUID.randomUUID());

        assertThat(result).isNotNull();
        assertThat(result.getTotalAmount()).isEqualTo(request.getAmount());
        verify(dealerInvoiceRepository).save(any(DealerInvoice.class));
    }

    @Test
    void getDealerInvoiceById_ShouldReturnInvoice() {
        when(dealerInvoiceRepository.findById(invoice.getDealerInvoiceId())).thenReturn(Optional.of(invoice));
        when(dealerPaymentMapper.toInvoiceResponse(invoice)).thenReturn(response);

        DealerInvoiceResponse result = dealerPaymentService.getDealerInvoiceById(invoice.getDealerInvoiceId());

        assertThat(result).isNotNull();
        assertThat(result.getDealerInvoiceId()).isEqualTo(invoice.getDealerInvoiceId());
    }
}
