package com.ev.sales_service.repository;

import com.ev.sales_service.entity.Outbox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;

@Repository
public interface OutboxRepository extends JpaRepository<Outbox, String> {

    List<Outbox> findByStatusOrderByCreatedAtAsc(String status, Pageable pageable);

    // Optional: mark as SENDING atomically to avoid multiple workers picking same rows
    @Modifying
    @Query("update Outbox o set o.status = ?2 where o.id = ?1 and o.status = ?3")
    int markStatusIfCurrent(String id, String newStatus, String currentStatus);
}
