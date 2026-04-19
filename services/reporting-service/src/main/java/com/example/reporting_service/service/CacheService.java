package com.example.reporting_service.service;

import com.example.reporting_service.model.DealerCache;
import com.example.reporting_service.model.VehicleCache;
import com.example.reporting_service.repository.DealerCacheRepository;
import com.example.reporting_service.repository.VehicleCacheRepository;
import com.ev.common_lib.event.DealerInfoEvent;
import com.ev.common_lib.event.VehicleInfoEvent;
import com.ev.common_lib.dto.vehicle.VariantDetailDto;
import com.ev.common_lib.dto.respond.ApiRespond;

import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.core.ParameterizedTypeReference;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CacheService {

    private final DealerCacheRepository dealerCacheRepo;
    private final VehicleCacheRepository vehicleCacheRepo;
    private final RestTemplate restTemplate;

    @Value("${app.services.dealer.url}") // Thêm vào application.yml
    private String dealerServiceUrl;
    @Value("${app.services.catalog.url}") // Thêm vào application.yml
    private String vehicleServiceUrl;

    /**
     * Lấy thông tin Dealer (Ưu tiên Cache, nếu không có thì gọi API)
     */
    public DealerCache getDealerInfo(UUID dealerId) {
        // 1. Thử lấy từ cache
        Optional<DealerCache> cacheOpt = dealerCacheRepo.findById(dealerId);
        if (cacheOpt.isPresent()) {
            return cacheOpt.get(); // Cache Hit!
        }

        // 2. Cache Miss! Gọi API
        log.warn("Cache Miss cho Dealer ID: {}. Đang gọi API...", dealerId);
        try {
            // Giả sử dealer-service có API trả về DTO này
            String url = dealerServiceUrl + "/api/dealers/" + dealerId;
            DealerInfoEvent dealerInfo = restTemplate.getForObject(url, DealerInfoEvent.class);

            if (dealerInfo != null) {
                // 3. Lưu vào cache cho lần sau
                DealerCache newCache = new DealerCache();
                newCache.setDealerId(dealerInfo.getDealerId());
                newCache.setDealerName(dealerInfo.getDealerName());
                newCache.setRegion(dealerInfo.getRegion());
                return dealerCacheRepo.save(newCache);
            }
        } catch (Exception e) {
            log.error("Lỗi khi lazy-load Dealer {}: {}", dealerId, e.getMessage());
        }
        return null;
    }

    /**
     * Lấy thông tin Vehicle (Ưu tiên Cache, nếu không có thì gọi API)
     */
    public VehicleCache getVehicleInfo(Long variantId) {
        // 1. Thử lấy từ cache
        Optional<VehicleCache> cacheOpt = vehicleCacheRepo.findById(variantId);
        if (cacheOpt.isPresent()) {
            return cacheOpt.get(); // Cache Hit!
        }

        // 2. Cache Miss! Gọi API
        log.warn("Cache Miss cho Variant ID: {}. Đang gọi API...", variantId);
        try {
            String url = vehicleServiceUrl + "/vehicle-catalog/variants/" + variantId;
            // API này trả về ApiRespond<VariantDetailDto>
            ResponseEntity<ApiRespond<VariantDetailDto>> response = restTemplate.exchange(
                    url, HttpMethod.GET, null, new ParameterizedTypeReference<ApiRespond<VariantDetailDto>>() {
                    });

            VariantDetailDto vehicleInfo = response.getBody().getData();

            if (vehicleInfo != null) {
                // 3. Lưu vào cache
                VehicleCache newCache = new VehicleCache();
                newCache.setVariantId(vehicleInfo.getVariantId());
                newCache.setVariantName(vehicleInfo.getVersionName());
                newCache.setModelId(vehicleInfo.getModelId());
                newCache.setModelName(vehicleInfo.getModelName());
                return vehicleCacheRepo.save(newCache);
            }
        } catch (Exception e) {
            log.error("Lỗi khi lazy-load Vehicle {}: {}", variantId, e.getMessage());
        }
        return null;
    }
}
