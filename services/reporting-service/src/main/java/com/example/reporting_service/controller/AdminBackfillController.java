package com.example.reporting_service.controller;

import com.example.reporting_service.model.DealerCache;
import com.example.reporting_service.model.VehicleCache;
import com.example.reporting_service.repository.DealerCacheRepository;
import com.example.reporting_service.repository.VehicleCacheRepository;
import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.dto.vehicle.VariantDetailDto;
import com.ev.common_lib.dto.dealer.DealerBasicDto;
import com.ev.common_lib.event.DealerInfoEvent; // (DTO này bạn cần tạo)

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/backfill")
@RequiredArgsConstructor
public class AdminBackfillController {

    private final DealerCacheRepository dealerCacheRepo;
    private final VehicleCacheRepository vehicleCacheRepo;
    private final RestTemplate restTemplate;

    @Value("${app.services.dealer.url}")
    private String dealerServiceUrl;
    @Value("${app.services.catalog.url}")
    private String vehicleServiceUrl;

    /**
     * API này sẽ gọi dealer-service, lấy TẤT CẢ đại lý
     * và lưu vào cache của reporting-service.
     */
    @PostMapping("/dealers")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<String> backfillDealers() {
        log.info("Bắt đầu tác vụ backfill dữ liệu Đại lý...");
        
        // 1. Gọi API "list-all" từ DealerController
        String url = dealerServiceUrl + "/api/dealers/list-all";
        
        ResponseEntity<ApiRespond<List<DealerBasicDto>>> response = restTemplate.exchange(
            url, HttpMethod.GET, null,
            // Sử dụng ParameterizedTypeReference để đọc cấu trúc ApiRespond<List<...>>
            new ParameterizedTypeReference<ApiRespond<List<DealerBasicDto>>>() {} 
        );
        
        List<DealerBasicDto> allDealers = response.getBody().getData();
        if (allDealers == null) {
            log.error("Backfill thất bại: Không nhận được dữ liệu từ dealer-service.");
            return ResponseEntity.badRequest().body("Lỗi: Không nhận được dữ liệu");
        }

        // 2. Chuyển đổi DTO sang Entity Cache
        List<DealerCache> dealerCaches = allDealers.stream().map(dto -> {
            DealerCache cache = new DealerCache();
            // LƯU Ý: Đảm bảo kiểu dữ liệu của bạn khớp (UUID hoặc Long)
            // Giả sử DealerCache dùng UUID ID
            cache.setDealerId(dto.getDealerId()); 
            cache.setDealerName(dto.getDealerName());
            cache.setRegion(dto.getRegion());
            return cache;
        }).collect(Collectors.toList());
            
        // 3. Xóa cache cũ và lưu cache mới
        dealerCacheRepo.deleteAllInBatch(); // Xóa sạch cache cũ
        dealerCacheRepo.saveAll(dealerCaches); // Lưu cache mới
        
        log.info("Hoàn thành backfill: Đã lưu {} đại lý.", dealerCaches.size());
        return ResponseEntity.ok("Đã lấp đầy " + dealerCaches.size() + " đại lý.");
    }

    /**
     * API này sẽ gọi vehicle-service, lấy TẤT CẢ xe
     * và lưu vào cache của reporting-service.
     */
    @PostMapping("/vehicles")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ResponseEntity<String> backfillVehicles() {
        log.info("Bắt đầu tác vụ backfill dữ liệu Xe (Vehicles)...");
        
        // 1. Gọi API "all-for-backfill" từ VehicleCatalogController
        String url = vehicleServiceUrl + "/vehicle-catalog/variants/all-for-backfill";
        
        ResponseEntity<ApiRespond<List<VariantDetailDto>>> response = restTemplate.exchange(
            url, HttpMethod.GET, null,
            new ParameterizedTypeReference<ApiRespond<List<VariantDetailDto>>>() {}
        );
        
        List<VariantDetailDto> allVehicles = response.getBody().getData();
        if (allVehicles == null) {
            log.error("Backfill thất bại: Không nhận được dữ liệu từ vehicle-service.");
            return ResponseEntity.badRequest().body("Lỗi: Không nhận được dữ liệu");
        }

        // 2. Chuyển đổi DTO sang Entity Cache
        List<VehicleCache> vehicleCaches = allVehicles.stream().map(dto -> {
            VehicleCache cache = new VehicleCache();
            cache.setVariantId(dto.getVariantId());
            cache.setVariantName(dto.getVersionName());
            cache.setModelId(dto.getModelId());
            cache.setModelName(dto.getModelName());
            return cache;
        }).collect(Collectors.toList());
            
        // 3. Xóa cache cũ và lưu cache mới
        vehicleCacheRepo.deleteAllInBatch(); // Xóa sạch cache cũ
        vehicleCacheRepo.saveAll(vehicleCaches); // Lưu cache mới
        
        log.info("Hoàn thành backfill: Đã lưu {} xe.", vehicleCaches.size());
        return ResponseEntity.ok("Đã lấp đầy " + vehicleCaches.size() + " xe.");
    }
}
