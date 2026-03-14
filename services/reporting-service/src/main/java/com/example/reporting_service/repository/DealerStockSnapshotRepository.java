package com.example.reporting_service.repository;

import com.example.reporting_service.model.DealerStockSnapshot;
import com.example.reporting_service.model.DealerStockSnapshotId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DealerStockSnapshotRepository 
    extends JpaRepository<DealerStockSnapshot, DealerStockSnapshotId> {
    
    // JpaRepository sẽ tự động cung cấp các hàm bạn cần
    // như findById(DealerStockSnapshotId id) và save(DealerStockSnapshot entity)
}
