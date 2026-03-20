package com.ev.payment_service.repository;

import com.ev.payment_service.entity.DealerDebtRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface DealerDebtRecordRepository extends JpaRepository<DealerDebtRecord, UUID> {
    // Repository này dùng PK là dealerId (UUID)
    // JpaRepository đã cung cấp đủ các hàm (findById, save)
}