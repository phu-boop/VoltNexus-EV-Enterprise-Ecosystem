package com.example.reporting_service.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.io.Serializable;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DealerStockSnapshotId implements Serializable {
    private UUID dealerId;
    private Long variantId;
}
