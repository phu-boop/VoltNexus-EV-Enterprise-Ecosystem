package com.ev.common_lib.model;

import com.ev.common_lib.model.enums.TransactionType;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class InventoryTransactionEventTest {

    @Test
    void inventoryTransactionEvent_GetterSetter() {
        InventoryTransactionEvent event = new InventoryTransactionEvent();
        event.setTransactionId(1L);
        event.setVariantId(2L);
        event.setTransactionType(TransactionType.SALE);
        event.setQuantity(10);
        event.setTransactionDate(LocalDateTime.now());
        event.setNotes("Refurbished stock");

        assertEquals(1L, event.getTransactionId());
        assertEquals(2L, event.getVariantId());
        assertEquals(TransactionType.SALE, event.getTransactionType());
        assertEquals(10, event.getQuantity());
        assertNotNull(event.getTransactionDate());
        assertEquals("Refurbished stock", event.getNotes());
    }
}
