package com.ev.sales_service.service.Implementation;

import com.ev.sales_service.client.CustomerClient;
import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.enums.OrderStatusB2C;
import com.ev.sales_service.repository.OrderItemRepository;
import com.ev.sales_service.repository.QuotationRepository;
import com.ev.sales_service.repository.SalesOrderRepositoryB2C;
import com.ev.sales_service.service.Interface.EmailService;
import com.ev.sales_service.service.Interface.SalesContractService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SalesOrderServiceB2CImplTest {

    @Mock
    private SalesOrderRepositoryB2C salesOrderRepository;

    @Mock
    private QuotationRepository quotationRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private SalesContractService salesContractService;

    @Mock
    private EmailService emailService;

    @Mock
    private CustomerClient customerClient;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private SalesOrderServiceB2CImpl salesOrderService;

    private SalesOrder order;

    @BeforeEach
    void setUp() {
        order = new SalesOrder();
        order.setOrderId(UUID.randomUUID());
        order.setOrderStatusB2C(OrderStatusB2C.PENDING);
    }

    @Test
    void getOrderById_ShouldReturnOrder() {
        when(salesOrderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));

        SalesOrder result = salesOrderService.getOrderById(order.getOrderId());

        assertThat(result).isNotNull();
        assertThat(result.getOrderId()).isEqualTo(order.getOrderId());
    }

    @Test
    void cancelOrder_ShouldUpdateStatus() {
        when(salesOrderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));
        when(salesOrderRepository.save(any(SalesOrder.class))).thenReturn(order);

        salesOrderService.cancelOrder(order.getOrderId(), "Test Reason");

        assertThat(order.getOrderStatusB2C()).isEqualTo(OrderStatusB2C.CANCELLED);
        verify(salesOrderRepository).save(order);
    }
}
