package com.ev.common_lib.dto.dealer;

import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class DealerBasicDtoTest {

    @Test
    void dealerBasicDto_GetterSetterAndConstructor() {
        UUID id = UUID.randomUUID();
        String name = "Test Dealer";
        String region = "North";

        DealerBasicDto dto = new DealerBasicDto(id, name, region);

        assertEquals(id, dto.getDealerId());
        assertEquals(name, dto.getDealerName());
        assertEquals(region, dto.getRegion());

        DealerBasicDto emptyDto = new DealerBasicDto();
        emptyDto.setDealerId(id);
        assertEquals(id, emptyDto.getDealerId());
    }
}
