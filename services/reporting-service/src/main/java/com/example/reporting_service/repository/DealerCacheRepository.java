package com.example.reporting_service.repository;

import com.example.reporting_service.model.DealerCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID; 

/**
 * Repository cho bảng cache thông tin Đại lý.
 */
@Repository
public interface DealerCacheRepository extends JpaRepository<DealerCache, UUID> { 

}
