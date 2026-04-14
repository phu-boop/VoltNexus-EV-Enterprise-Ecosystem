package com.ev.common_lib.event;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class CommonEventTests {

    @Test
    void orderPlacedEvents_Test() {
        UUID orderId = UUID.randomUUID();
        UUID dealerId = UUID.randomUUID();
        B2BOrderPlacedEvent b2b = new B2BOrderPlacedEvent();
        b2b.setOrderId(orderId);
        b2b.setDealerId(dealerId);
        assertEquals(orderId, b2b.getOrderId());
        assertEquals(dealerId, b2b.getDealerId());

        B2COrderPlacedEvent b2c = new B2COrderPlacedEvent();
        b2c.setOrderId(orderId);
        b2c.setCustomerId(1L);
        assertEquals(orderId, b2c.getOrderId());
        assertEquals(1L, b2c.getCustomerId());
    }

    @Test
    void dealerEvents_Test() {
        UUID dealerId = UUID.randomUUID();
        DealerInfoEvent info = new DealerInfoEvent();
        info.setDealerId(dealerId);
        info.setDealerName("Dealer 1");
        assertEquals(dealerId, info.getDealerId());

        DealerStockUpdatedEvent stock = new DealerStockUpdatedEvent();
        stock.setDealerId(dealerId);
        stock.setVariantId(1L);
        stock.setNewAvailableQuantity(50);
        assertEquals(50, stock.getNewAvailableQuantity());
    }

    @Test
    void orderLifecycleEvents_Test() {
        UUID orderId = UUID.randomUUID();
        OrderCancelledEvent cancelled = new OrderCancelledEvent();
        cancelled.setOrderId(orderId);
        cancelled.setCancelledByEmail("test@example.com");
        assertEquals("test@example.com", cancelled.getCancelledByEmail());

        OrderDeliveredEvent delivered = new OrderDeliveredEvent();
        delivered.setOrderId(orderId);
        delivered.setDeliveryDate(LocalDateTime.now());
        assertNotNull(delivered.getDeliveryDate());

        OrderIssueReportedEvent issue = new OrderIssueReportedEvent();
        issue.setOrderId(orderId);
        issue.setDescription("Damaged");
        assertEquals("Damaged", issue.getDescription());
    }

    @Test
    void productAndPromotionEvents_Test() {
        ProductUpdateEvent product = new ProductUpdateEvent();
        product.setVariantId(1L);
        product.setNewPrice(BigDecimal.valueOf(50000));
        assertEquals(1L, product.getVariantId());

        PromotionCreatedEvent promo = new PromotionCreatedEvent(
                "E1", UUID.randomUUID(), "Promo", "Desc", BigDecimal.TEN,
                LocalDateTime.now(), LocalDateTime.now().plusDays(1), LocalDateTime.now()
        );
        assertEquals("Promo", promo.getPromotionName());
    }

    @Test
    void stockAndVehicleEvents_Test() {
        StockAlertEvent alert = new StockAlertEvent();
        alert.setVariantId(1L);
        alert.setThreshold(5);
        alert.setCurrentStock(2);
        assertEquals(2, alert.getCurrentStock());

        VehicleInfoEvent vehicle = new VehicleInfoEvent();
        vehicle.setVariantId(1L);
        vehicle.setVariantName("Variant 1");
        assertEquals("Variant 1", vehicle.getVariantName());
    }
}
