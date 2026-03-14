package com.ev.inventory_service.repository;

import com.ev.inventory_service.model.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    // --- PHƯƠNG THỨC MỚI DÀNH CHO XUẤT BÁO CÁO (trả về List) ---
    List<InventoryTransaction> findAllByTransactionDateBetween(LocalDateTime start, LocalDateTime end);

    // --- GIỮ LẠI PHƯƠNG THỨC CŨ DÀNH CHO API XEM LỊCH SỬ (trả về Page) ---
    Page<InventoryTransaction> findAllByTransactionDateBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
}