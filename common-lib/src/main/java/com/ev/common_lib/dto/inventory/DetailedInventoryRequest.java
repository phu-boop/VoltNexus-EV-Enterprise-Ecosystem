package com.ev.common_lib.dto.inventory;

import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class DetailedInventoryRequest {
    private List<Long> variantIds; 

    private UUID dealerId;
}

