package com.ev.sales_service.service.Implementation;

import com.ev.sales_service.dto.response.SalesOrderB2CResponse;
import com.ev.sales_service.entity.SalesOrder;
import com.ev.sales_service.repository.SalesOrderRepositoryB2C;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SalesOrderServiceB2CImplTest {

    @Mock
    private SalesOrderRepositoryB2C salesOrderRepository;

    @InjectMocks
    private SalesOrderServiceB2CImpl salesOrderService;

    private SalesOrder order;

    @BeforeEach
    void setUp() {
        order = new SalesOrder();
        order.setOrderId(UUID.randomUUID());
    }

    @Test
    void getSalesOrderById_ShouldReturnResponse() {
        when(salesOrderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));

        SalesOrderB2CResponse result = salesOrderService.getSalesOrderById(order.getOrderId());

        assertThat(result).isNotNull();
        assertThat(result.getOrderId()).isEqualTo(order.getOrderId());
    }

    @Test
    void rejectSalesOrder_ShouldReturnResponse() {
        when(salesOrderRepository.findById(order.getOrderId())).thenReturn(Optional.of(order));
        when(salesOrderRepository.save(any(SalesOrder.class))).thenReturn(order);

        SalesOrderB2CResponse result = salesOrderService.rejectSalesOrder(order.getOrderId(), "Reason");

        assertThat(result).isNotNull();
        verify(salesOrderRepository).save(any(SalesOrder.class));
    }
}
