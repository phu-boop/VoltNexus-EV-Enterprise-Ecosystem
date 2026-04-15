package com.ev.common_lib.dto.inventory;

import com.ev.common_lib.model.enums.TransactionType;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class InventoryDtoTests {

    @Test
    void allocationRequestDto_Test() {
        AllocationRequestDto dto = new AllocationRequestDto();
        dto.setOrderId(UUID.randomUUID());
        
        AllocationRequestDto.AllocationItem item = new AllocationRequestDto.AllocationItem();
        item.setVariantId(1L);
        item.setQuantity(10);
        dto.setItems(Collections.singletonList(item));
        
        assertEquals(1, dto.getItems().size());
        assertEquals(10, dto.getItems().get(0).getQuantity());
    }

    @Test
    void shipmentRequestDto_Test() {
        ShipmentRequestDto dto = new ShipmentRequestDto();
        dto.setOrderId(UUID.randomUUID());
        dto.setDealerId(UUID.randomUUID());
        
        ShipmentRequestDto.ShipmentItem item = new ShipmentRequestDto.ShipmentItem();
        item.setVariantId(1L);
        item.setVins(Collections.singletonList("VIN123"));
        dto.setItems(Collections.singletonList(item));
        
        assertEquals(1, dto.getItems().size());
        assertEquals("VIN123", dto.getItems().get(0).getVins().get(0));
    }

    @Test
    void detailedInventoryRequest_Test() {
        DetailedInventoryRequest dto = new DetailedInventoryRequest();
        dto.setVariantIds(Collections.singletonList(1L));
        dto.setDealerId(UUID.randomUUID());
        
        assertEquals(1, dto.getVariantIds().size());
        assertNotNull(dto.getDealerId());
    }

    @Test
    void transactionRequestDto_Test() {
        TransactionRequestDto dto = new TransactionRequestDto();
        dto.setTransactionType(TransactionType.INITIAL_STOCK);
        dto.setVariantId(1L);
        dto.setQuantity(5);
        
        assertEquals(TransactionType.INITIAL_STOCK, dto.getTransactionType());
        assertEquals(1L, dto.getVariantId());
        assertEquals(5, dto.getQuantity());
    }

    @Test
    void inventoryComparisonDto_Test() {
        InventoryComparisonDto dto = new InventoryComparisonDto();
        dto.setVariantId(1L);
        dto.setCentralStockAvailable(10);
        dto.setDealerStockAvailable(9);
        
        assertEquals(1L, dto.getVariantId());
        assertEquals(10, dto.getCentralStockAvailable());
        assertEquals(9, dto.getDealerStockAvailable());
    }

    @Test
    void vinValidationResultDto_Test() {
        VinValidationResultDto dto = VinValidationResultDto.builder()
                .validVins(Collections.singletonList("VIN123"))
                .invalidVins(Collections.singletonMap("VIN456", "Invalid"))
                .build();
        
        assertEquals(1, dto.getValidVins().size());
        assertEquals("Invalid", dto.getInvalidVins().get("VIN456"));
    }
}
