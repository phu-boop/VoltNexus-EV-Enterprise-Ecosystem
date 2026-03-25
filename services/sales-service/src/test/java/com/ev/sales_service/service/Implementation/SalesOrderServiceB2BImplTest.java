package com.ev.sales_service.service.Implementation;

import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.enums.OrderStatusB2B;
import com.ev.sales_service.repository.NotificationRepository;
import com.ev.sales_service.repository.OutboxRepository;
import com.ev.sales_service.repository.SalesOrderRepositoryB2B;
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
class SalesOrderServiceB2BImplTest {

    @Mock
    private SalesOrderRepositoryB2B salesOrderRepository;

    @Mock
    private OutboxRepository outboxRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private SalesOrderServiceB2BImpl salesOrderService;

    private SalesOrder order;

    @BeforeEach
    void setUp() {
        order = new SalesOrder();
        order.setOrderId(UUID.randomUUID());
        order.setOrderStatusB2B(OrderStatusB2B.PENDING);
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

        assertThat(order.getOrderStatusB2B()).isEqualTo(OrderStatusB2B.CANCELLED);
        verify(salesOrderRepository).save(order);
    }
}
