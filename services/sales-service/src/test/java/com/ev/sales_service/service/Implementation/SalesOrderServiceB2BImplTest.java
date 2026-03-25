package com.ev.sales_service.service.Implementation;

import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.enums.OrderStatusB2B;
import com.ev.sales_service.enums.SaleOderType;
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
    private SalesOrderRepositoryB2B salesOrderRepositoryB2B;

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
        order.setOrderStatus(OrderStatusB2B.PENDING);
        order.setTypeOder(SaleOderType.B2B);
    }

    @Test
    void getOrderById_ShouldReturnOrder() {
        when(salesOrderRepositoryB2B.findById(order.getOrderId())).thenReturn(Optional.of(order));

        SalesOrder result = salesOrderService.getOrderById(order.getOrderId());

        assertThat(result).isNotNull();
        assertThat(result.getOrderId()).isEqualTo(order.getOrderId());
    }

    @Test
    void cancelOrderByStaff_ShouldUpdateStatus() {
        when(salesOrderRepositoryB2B.findByOrderIdAndTypeOder(order.getOrderId(), SaleOderType.B2B))
                .thenReturn(Optional.of(order));
        when(salesOrderRepositoryB2B.save(any(SalesOrder.class))).thenReturn(order);

        salesOrderService.cancelOrderByStaff(order.getOrderId(), "staff@ev.com");

        assertThat(order.getOrderStatus()).isEqualTo(OrderStatusB2B.CANCELLED);
        verify(salesOrderRepositoryB2B).save(order);
    }
}
