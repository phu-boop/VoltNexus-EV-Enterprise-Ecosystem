package com.ev.common_lib.model.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EnumTests {

    @Test
    void evmAction_Test() {
        assertNotNull(EVMAction.valueOf("CREATE"));
        assertEquals("CREATE", EVMAction.CREATE.name());
    }

    @Test
    void inventoryLevelStatus_Test() {
        assertNotNull(InventoryLevelStatus.valueOf("IN_STOCK"));
        assertEquals("IN_STOCK", InventoryLevelStatus.IN_STOCK.name());
    }

    @Test
    void transactionType_Test() {
        assertNotNull(TransactionType.valueOf("SALE"));
        assertEquals("SALE", TransactionType.SALE.name());
    }

    @Test
    void vehicleStatus_Test() {
        assertNotNull(VehicleStatus.valueOf("IN_PRODUCTION"));
        assertEquals("IN_PRODUCTION", VehicleStatus.IN_PRODUCTION.name());
    }
}
