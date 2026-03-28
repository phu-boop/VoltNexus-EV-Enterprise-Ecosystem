package com.ev.vehicle_service.services.Implementation;

import com.ev.common_lib.dto.vehicle.VariantDetailDto;
import com.ev.common_lib.dto.vehicle.FeatureDto;
import com.ev.common_lib.dto.vehicle.ComparisonDto;
import com.ev.common_lib.dto.inventory.InventoryComparisonDto;
import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.model.enums.VehicleStatus;
import com.ev.common_lib.model.enums.EVMAction;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.common_lib.event.ProductUpdateEvent;

import com.ev.vehicle_service.dto.request.CreateModelRequest;
// import com.ev.vehicle_service.dto.request.FeatureRequest;
import com.ev.vehicle_service.dto.request.UpdateModelRequest;
import com.ev.vehicle_service.dto.request.UpdateVariantRequest;
import com.ev.vehicle_service.dto.request.CreateVariantRequest;
import com.ev.vehicle_service.dto.request.FeatureRequest;
import com.ev.vehicle_service.dto.request.CreateFeatureRequest;
import com.ev.vehicle_service.dto.request.UpdateFeatureRequest;
import com.ev.vehicle_service.dto.response.ModelDetailDto;
import com.ev.vehicle_service.dto.response.ModelSummaryDto;

import com.ev.vehicle_service.dto.response.PriceHistoryDto;
import com.ev.vehicle_service.dto.response.VariantHistoryDto;
import com.ev.vehicle_service.model.VehicleFeature;
import com.ev.vehicle_service.model.VehicleModel;
import com.ev.vehicle_service.model.VehicleVariant;
import com.ev.vehicle_service.model.VariantFeature;
import com.ev.vehicle_service.model.VariantFeatureId;
import com.ev.vehicle_service.model.PriceHistory;
import com.ev.vehicle_service.model.VehicleVariantHistory;

import com.ev.vehicle_service.repository.VehicleFeatureRepository;
import com.ev.vehicle_service.repository.VehicleModelRepository;
import com.ev.vehicle_service.repository.VehicleVariantRepository;
import com.ev.vehicle_service.repository.VariantFeatureRepository;
import com.ev.vehicle_service.repository.PriceHistoryRepository;
import com.ev.vehicle_service.repository.VehicleVariantHistoryRepository;

import com.ev.vehicle_service.services.Interface.VehicleCatalogService;
import com.ev.vehicle_service.specification.VehicleVariantSpecification;
// import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.domain.Specification;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
// import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import java.util.stream.Collectors;
import com.ev.vehicle_service.dto.response.FeatureVariantDto;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;
// Cache for vehicle
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;

import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.util.Collections;
import java.math.BigDecimal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class VehicleCatalogServiceImpl implements VehicleCatalogService {

    private static final Logger log = LoggerFactory.getLogger(VehicleCatalogServiceImpl.class);

    private final VehicleModelRepository modelRepository;
    private final VehicleVariantRepository variantRepository;
    private final VehicleFeatureRepository featureRepository;
    private final VariantFeatureRepository variantFeatureRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final VehicleVariantHistoryRepository variantHistoryRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    private final RestTemplate restTemplate;

    @Value("${app.services.inventory.url}")
    private String inventoryServiceUrl;

    @Override
    @Cacheable(value = "all-models", key = "#sort != null ? #sort.toString() : 'default'")
    public List<ModelSummaryDto> getAllModels(Sort sort) {
        Sort sortToUse = (sort != null && sort.isSorted()) ? sort : Sort.by(Direction.ASC, "modelName");

        return modelRepository.findAll(sortToUse).stream()
                .map(this::mapToModelSummaryDto)
                .collect(Collectors.toList());
    }

    @Override
    // Removed @Cacheable - Page objects don't serialize/deserialize well in Redis
    public Page<ModelSummaryDto> getAllModelsPaginated(Pageable pageable) {
        Page<VehicleModel> modelsPage = modelRepository.findAll(pageable);
        return modelsPage.map(this::mapToModelSummaryDto);
    }

    @Override
    // Removed @Cacheable - Page objects don't serialize/deserialize well in Redis
    public Page<ModelSummaryDto> searchModels(
            String keyword,
            String status,
            java.math.BigDecimal minPrice,
            java.math.BigDecimal maxPrice,
            Integer minRange,
            Integer maxRange,
            Pageable pageable) {

        // Convert String status to Enum
        VehicleStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try {
                if ("AVAILABLE".equalsIgnoreCase(status)) {
                    statusEnum = VehicleStatus.IN_PRODUCTION;
                } else {
                    statusEnum = VehicleStatus.valueOf(status.toUpperCase());
                }
            } catch (IllegalArgumentException e) {
                // If invalid status passed, maybe ignore or throw?
                // For search safety, we can ignore invalid status or log it.
                // Assuming we treat invalid status as "no filter" or just pass null.
                log.warn("Invalid status parameter: {}", status);
            }
        }

        // Use repository search method
        Page<VehicleModel> modelsPage = modelRepository.searchModels(keyword, statusEnum, pageable);

        // Apply additional filters if needed
        List<VehicleModel> filteredModels = modelsPage.getContent().stream()
                .filter(model -> {
                    // Filter by price range if specified
                    if (minPrice != null || maxPrice != null) {
                        boolean matchesPrice = model.getVariants().stream()
                                .anyMatch(v -> {
                                    if (v.getPrice() == null)
                                        return false;
                                    if (minPrice != null && v.getPrice().compareTo(minPrice) < 0)
                                        return false;
                                    if (maxPrice != null && v.getPrice().compareTo(maxPrice) > 0)
                                        return false;
                                    return true;
                                });
                        if (!matchesPrice)
                            return false;
                    }

                    // Filter by range if specified
                    if (minRange != null || maxRange != null) {
                        Integer modelRange = model.getBaseRangeKm();
                        if (modelRange == null) {
                            // Check variants
                            modelRange = model.getVariants().stream()
                                    .map(VehicleVariant::getRangeKm)
                                    .filter(java.util.Objects::nonNull)
                                    .findFirst()
                                    .orElse(null);
                        }
                        if (modelRange == null)
                            return false;
                        if (minRange != null && modelRange < minRange)
                            return false;
                        if (maxRange != null && modelRange > maxRange)
                            return false;
                    }

                    return true;
                })
                .collect(Collectors.toList());

        // Create new page with filtered content
        Page<VehicleModel> filteredPage = new org.springframework.data.domain.PageImpl<>(
                filteredModels,
                pageable,
                filteredModels.size());

        return filteredPage.map(this::mapToModelSummaryDto);
    }

    @Override
    // Removed @Cacheable - Complex DTOs don't serialize/deserialize well in Redis
    public ModelDetailDto getModelDetails(Long modelId) {
        VehicleModel model = modelRepository.findModelWithDetailsById(modelId)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_MODEL_NOT_FOUND));
        return mapToModelDetailDto(model);
    }

    @Override
    // Removed @Cacheable - Complex DTOs don't serialize/deserialize well in Redis
    public VariantDetailDto getVariantDetails(Long variantId) {
        VehicleVariant variant = findVariantById(variantId);
        return mapToVariantDetailDto(variant);
    }

    @Override
    @Transactional
    public VehicleModel createModelWithVariants(CreateModelRequest request) {
        VehicleModel newModel = new VehicleModel();
        newModel.setModelName(request.getModelName());
        newModel.setBrand(request.getBrand());
        newModel.setStatus(request.getStatus() != null ? request.getStatus() : VehicleStatus.COMING_SOON);
        // --- XỬ LÝ DỮ LIỆU HYBRID ---
        // Gán các thông số cốt lõi
        newModel.setBaseRangeKm(request.getBaseRangeKm());
        newModel.setBaseMotorPower(request.getBaseMotorPower());
        newModel.setBaseBatteryCapacity(request.getBaseBatteryCapacity());
        newModel.setThumbnailUrl(request.getThumbnailUrl());
        newModel.setCreatedBy(request.getCreatedBy());

        // Chuyển đổi Map thông số mở rộng thành chuỗi JSON
        try {
            if (request.getExtendedSpecs() != null && !request.getExtendedSpecs().isEmpty()) {
                String jsonString = objectMapper.writeValueAsString(request.getExtendedSpecs());
                newModel.setExtendedSpecsJson(jsonString);
            }
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_JSON_FORMAT);
        }

        VehicleModel savedModel = modelRepository.save(newModel);

        request.getVariants().forEach(variantRequest -> {
            VehicleVariant newVariant = new VehicleVariant();
            newVariant.setVersionName(variantRequest.getVersionName());
            newVariant.setColor(variantRequest.getColor());
            newVariant.setPrice(variantRequest.getPrice());
            newVariant.setWholesalePrice(variantRequest.getWholesalePrice());
            newVariant.setImageUrl(variantRequest.getImageUrl());
            newVariant.setSkuCode(variantRequest.getSkuCode());
            newVariant.setStatus(VehicleStatus.IN_PRODUCTION);
            newVariant.setVehicleModel(savedModel);

            // Trạng thái Vehicle nếu để trống thì dùng giá trị mặc định là IN_PRODUCTION.
            VehicleStatus status = (variantRequest.getStatus() != null) ? variantRequest.getStatus()
                    : VehicleStatus.IN_PRODUCTION;
            newVariant.setStatus(status);
            VehicleVariant savedVariant = variantRepository.save(newVariant);

            if (variantRequest.getFeatures() != null && !variantRequest.getFeatures().isEmpty()) {
                variantRequest.getFeatures().forEach(featureRequest -> {
                    VehicleFeature feature = featureRepository.findById(featureRequest.getFeatureId())
                            .orElseThrow(() -> new AppException(ErrorCode.FEATURE_NOT_FOUND));

                    VariantFeature variantFeature = new VariantFeature();
                    variantFeature.setId(new VariantFeatureId(savedVariant.getVariantId(), feature.getFeatureId()));
                    variantFeature.setVehicleVariant(savedVariant);
                    variantFeature.setVehicleFeature(feature);
                    variantFeature.setStandard(featureRequest.isStandard());
                    variantFeature.setAdditionalCost(featureRequest.getAdditionalCost());

                    variantFeatureRepository.save(variantFeature);
                });
            }
        });

        return savedModel;
    }

    @Override
    @Transactional
    public VehicleVariant createVariant(Long modelId, CreateVariantRequest request, String createdByEmail) {
        // Tìm mẫu xe cha (parent model)
        VehicleModel parentModel = findModelById(modelId);

        VehicleVariant newVariant = new VehicleVariant();

        newVariant.setVersionName(request.getVersionName());
        newVariant.setColor(request.getColor());
        newVariant.setPrice(request.getPrice());
        newVariant.setWholesalePrice(request.getWholesalePrice());
        newVariant.setSkuCode(request.getSkuCode());
        newVariant.setImageUrl(request.getImageUrl());

        // Set technical specifications
        newVariant.setBatteryCapacity(request.getBatteryCapacity());
        newVariant.setChargingTime(request.getChargingTime());
        newVariant.setRangeKm(request.getRangeKm());
        newVariant.setMotorPower(request.getMotorPower());

        // Set additional technical specifications
        newVariant.setSeatingCapacity(request.getSeatingCapacity());
        newVariant.setTorque(request.getTorque());
        newVariant.setAcceleration(request.getAcceleration());
        newVariant.setTopSpeed(request.getTopSpeed());
        newVariant.setDimensions(request.getDimensions());
        newVariant.setWeight(request.getWeight());
        newVariant.setWarrantyYears(request.getWarrantyYears());
        newVariant.setDescription(request.getDescription());
        newVariant.setColorImages(request.getColorImages());
        newVariant.setExteriorImages(request.getExteriorImages());
        newVariant.setInteriorImages(request.getInteriorImages());

        // Thiết lập mối quan hệ với mẫu xe cha
        newVariant.setVehicleModel(parentModel);

        VehicleStatus status = (request.getStatus() != null) ? request.getStatus() : VehicleStatus.IN_PRODUCTION;
        newVariant.setStatus(status);
        newVariant.setCreatedBy(createdByEmail);

        return variantRepository.save(newVariant);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "models", key = "#modelId"), // Xóa cache model cụ thể
            @CacheEvict(value = "all-models", allEntries = true) // Xóa toàn bộ cache danh sách
    })
    public VehicleModel updateModel(Long modelId, UpdateModelRequest request, String updatedByEmail) {
        VehicleModel model = findModelById(modelId);
        model.setModelName(request.getModelName());
        model.setBrand(request.getBrand());
        model.setStatus(request.getStatus());
        model.setUpdatedBy(updatedByEmail);
        model.setThumbnailUrl(request.getThumbnailUrl());
        // --- XỬ LÝ DỮ LIỆU HYBRID ---
        // Cập nhật các thông số cốt lõi
        model.setBaseRangeKm(request.getBaseRangeKm());
        model.setBaseMotorPower(request.getBaseMotorPower());
        model.setBaseBatteryCapacity(request.getBaseBatteryCapacity());
        model.setBaseChargingTime(request.getBaseChargingTime());

        // Cập nhật chuỗi JSON từ Map thông số mở rộng
        try {
            if (request.getExtendedSpecs() != null) {
                String jsonString = objectMapper.writeValueAsString(request.getExtendedSpecs());
                model.setExtendedSpecsJson(jsonString);
            } else {
                model.setExtendedSpecsJson(null); // Cho phép xóa hết thông số mở rộng
            }
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_JSON_FORMAT);
        }

        return modelRepository.save(model);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "variants", key = "#variantId"), // Xóa cache variant
            @CacheEvict(value = "models", key = "#result.vehicleModel.modelId"), // Xóa cache model cha
            @CacheEvict(value = "all-models", allEntries = true) // Xóa cache danh sách
    })
    public VehicleVariant updateVariant(Long variantId, UpdateVariantRequest request, String updatedByEmail) {
        // Tìm variant hiện có
        VehicleVariant variant = findVariantById(variantId);

        // KIỂM TRA VÀ LƯU LỊCH SỬ GIÁ
        // So sánh giá cũ với giá mới từ request (chỉ lưu lịch sử nếu giá thực sự thay
        // đổi)
        if (request.getPrice() != null && variant.getPrice().compareTo(request.getPrice()) != 0) {

            // Tạo một đối tượng PriceHistory mới
            PriceHistory history = new PriceHistory();
            history.setVehicleVariant(variant);
            history.setOldPrice(variant.getPrice()); // Lấy giá cũ từ variant
            history.setNewPrice(request.getPrice()); // Lấy giá mới từ request
            history.setChangeDate(LocalDateTime.now());
            history.setChangedBy(updatedByEmail);
            history.setReason(request.getReason());

            // Lưu lại lịch sử
            priceHistoryRepository.save(history);
        }

        saveVariantHistory(variant, EVMAction.UPDATE, updatedByEmail);
        // Cập nhật thông tin cho variant

        // Kiểm tra nếu SKU thay đổi và xử lý trùng lặp
        if (request.getSkuCode() != null && !request.getSkuCode().equals(variant.getSkuCode())) {
            if (variantRepository.existsBySkuCode(request.getSkuCode())) {
                throw new AppException(ErrorCode.VEHICLE_VARIANT_SKU_ALREADY_EXISTS);
            }
            variant.setSkuCode(request.getSkuCode());
        }

        variant.setVersionName(request.getVersionName());
        variant.setColor(request.getColor());
        variant.setPrice(request.getPrice());
        variant.setStatus(request.getStatus());
        variant.setImageUrl(request.getImageUrl());

        // Dùng if để kiểm tra null, tránh ghi đè giá trị nếu frontend không gửi lên
        if (request.getWholesalePrice() != null)
            variant.setWholesalePrice(request.getWholesalePrice());
        if (request.getBatteryCapacity() != null)
            variant.setBatteryCapacity(request.getBatteryCapacity());
        if (request.getChargingTime() != null)
            variant.setChargingTime(request.getChargingTime());
        if (request.getRangeKm() != null)
            variant.setRangeKm(request.getRangeKm());
        if (request.getMotorPower() != null)
            variant.setMotorPower(request.getMotorPower());

        // Update additional technical specifications
        if (request.getSeatingCapacity() != null)
            variant.setSeatingCapacity(request.getSeatingCapacity());
        if (request.getTorque() != null)
            variant.setTorque(request.getTorque());
        if (request.getAcceleration() != null)
            variant.setAcceleration(request.getAcceleration());
        if (request.getTopSpeed() != null)
            variant.setTopSpeed(request.getTopSpeed());
        if (request.getDimensions() != null)
            variant.setDimensions(request.getDimensions());
        if (request.getWeight() != null)
            variant.setWeight(request.getWeight());
        if (request.getWarrantyYears() != null)
            variant.setWarrantyYears(request.getWarrantyYears());
        if (request.getDescription() != null)
            variant.setDescription(request.getDescription());
        if (request.getColorImages() != null)
            variant.setColorImages(request.getColorImages());
        if (request.getExteriorImages() != null)
            variant.setExteriorImages(request.getExteriorImages());
        if (request.getInteriorImages() != null)
            variant.setInteriorImages(request.getInteriorImages());

        VehicleVariant savedVariant = variantRepository.save(variant);

        // Gửi message lên kafka
        try {
            ProductUpdateEvent event = new ProductUpdateEvent();
            event.setVariantId(savedVariant.getVariantId());
            event.setModelName(savedVariant.getVehicleModel().getModelName());
            event.setVersionName(savedVariant.getVersionName());
            event.setColor(savedVariant.getColor());
            event.setNewPrice(savedVariant.getPrice());
            event.setStatus(savedVariant.getStatus().name());
            event.setImageUrl(savedVariant.getImageUrl());

            kafkaTemplate.send("product_events", event);

        } catch (Exception e) {
            System.err.println("WARN: Failed to send product update event to Kafka. " + e.getMessage());
        }

        return savedVariant;
    }

    @Override
    @Transactional
    public void deactivateModel(Long modelId, String updatedByEmail) {
        VehicleModel model = findModelById(modelId);

        model.setStatus(VehicleStatus.DISCONTINUED);
        model.setUpdatedBy(updatedByEmail);
        modelRepository.save(model);

        model.getVariants().forEach(variant -> {
            saveVariantHistory(variant, EVMAction.DELETE, updatedByEmail); // Cập nhật lại lịch sử chỉnh sửa
            variant.setStatus(VehicleStatus.DISCONTINUED); // Cập nhật lại trạng thái
            variantRepository.save(variant);
        });
    }

    @Override
    @Transactional
    public void deactivateVariant(Long variantId, String updatedByEmail) {
        VehicleVariant variant = findVariantById(variantId);
        variant.setStatus(VehicleStatus.DISCONTINUED);
        variantRepository.save(variant);
    }

    @Override
    public List<Long> searchVariantIdsByCriteria(String keyword, String color, String versionName) {
        List<Specification<VehicleVariant>> specs = new ArrayList<>();

        // Thêm điều kiện tìm kiếm chung theo keyword
        if (keyword != null && !keyword.isBlank()) {
            specs.add(VehicleVariantSpecification.hasKeyword(keyword));
        }

        // Thêm các điều kiện lọc chi tiết
        if (color != null && !color.isBlank()) {
            specs.add(VehicleVariantSpecification.hasColor(color));
        }
        if (versionName != null && !versionName.isBlank()) {
            specs.add(VehicleVariantSpecification.hasVersionName(versionName));
        }

        Specification<VehicleVariant> finalSpec = specs.stream().reduce(Specification::and).orElse(null);

        List<VehicleVariant> variants = variantRepository.findAll(finalSpec);
        return variants.stream().map(VehicleVariant::getVariantId).collect(Collectors.toList());
    }

    @Override
    public List<VariantDetailDto> getVariantDetailsByIds(List<Long> variantIds) {
        if (variantIds == null || variantIds.isEmpty()) {
            return new ArrayList<>(); // Trả về danh sách rỗng nếu không có ID nào
        }

        // Dùng findAllById để lấy tất cả trong một câu lệnh SQL
        List<VehicleVariant> variants = variantRepository.findAllById(variantIds);

        // Map kết quả sang DTO
        return variants.stream()
                .map(this::mapToVariantDetailDto)
                .collect(Collectors.toList());
    }

    /**
     * Triển khai logic cho API phân trang/tìm kiếm (Có cả status)
     */
    @Override
    public Page<VariantDetailDto> getAllVariantsPaginated(String search, String status, Double minPrice,
            Double maxPrice, Pageable pageable) {

        Specification<VehicleVariant> searchSpec = VehicleVariantSpecification.hasKeyword(search);
        Specification<VehicleVariant> statusSpec = null;

        if (status != null && !status.isBlank()) {
            List<Long> inventoryIds = getVariantIdsFromInventory(status);
            statusSpec = VehicleVariantSpecification.hasVariantIdIn(inventoryIds);
        }

        Specification<VehicleVariant> priceSpecMin = null;
        if (minPrice != null) {
            priceSpecMin = VehicleVariantSpecification.isPriceGreaterThanOrEqual(minPrice);
        }

        Specification<VehicleVariant> priceSpecMax = null;
        if (maxPrice != null) {
            priceSpecMax = VehicleVariantSpecification.isPriceLessThanOrEqual(maxPrice);
        }

        Specification<VehicleVariant> finalSpec = Specification.allOf(
                searchSpec,
                statusSpec,
                priceSpecMin,
                priceSpecMax);

        Page<VehicleVariant> variantPage = variantRepository.findAll(finalSpec, pageable);
        return variantPage.map(this::mapToVariantDetailDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComparisonDto> getComparisonData(List<Long> variantIds, UUID dealerId, HttpHeaders headers) {

        // Lấy thông tin chi tiết sản phẩm (Thông số, giá...)
        // Lấy từ database của chính service này (vehicle-service).
        List<VariantDetailDto> vehicleDetails = variantRepository.findAllWithDetailsByIds(variantIds).stream()
                .map(this::mapToVariantDetailDto)
                .collect(Collectors.toList());

        // Gọi API sang Inventory-Service để lấy thông tin tồn kho
        String inventoryUrl = inventoryServiceUrl + "/inventory/status-by-ids-detailed";

        // Tạo request body chứa cả 2 thông tin
        Map<String, Object> requestBody = Map.of(
                "variantIds", variantIds,
                "dealerId", dealerId.toString() // Gửi dealerId để service kho biết
        );

        // Chuyển tiếp các header xác thực từ request gốc
        HttpHeaders forwardHeaders = new HttpHeaders();
        if (headers != null) {
            forwardHeaders.addAll(headers);
        }
        // Đảm bảo có Content-Type header
        forwardHeaders.set("Content-Type", "application/json");

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, forwardHeaders);

        ResponseEntity<ApiRespond<List<InventoryComparisonDto>>> inventoryResponse;
        try {
            log.debug("Calling inventory-service at: {}", inventoryUrl);
            log.debug("Request headers: {}", forwardHeaders);
            inventoryResponse = restTemplate.exchange(
                    inventoryUrl,
                    HttpMethod.POST,
                    requestEntity,
                    // Dùng ParameterizedTypeReference để xử lý kiểu Generic (List<...>)
                    new ParameterizedTypeReference<ApiRespond<List<InventoryComparisonDto>>>() {
                    });
        } catch (Exception e) {
            // Xử lý lỗi nếu không gọi được service kho
            log.error("Error calling inventory-service at {}: {}", inventoryUrl, e.getMessage(), e);
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }

        if (inventoryResponse.getBody() == null || inventoryResponse.getBody().getData() == null) {
            throw new AppException(ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }

        List<InventoryComparisonDto> inventoryStatusList = inventoryResponse.getBody().getData();

        // Tạo Map để tra cứu nhanh <VariantId, ThongTinKho>
        Map<Long, InventoryComparisonDto> inventoryMap = inventoryStatusList.stream()
                .collect(Collectors.toMap(InventoryComparisonDto::getVariantId, status -> status));

        // BƯỚC 3: Gộp (Merge) hai luồng dữ liệu
        return vehicleDetails.stream()
                .map(detail -> {
                    // Lấy thông tin kho từ Map, nếu không có thì tạo đối tượng rỗng
                    InventoryComparisonDto inventoryInfo = inventoryMap.getOrDefault(detail.getVariantId(),
                            new InventoryComparisonDto());
                    return new ComparisonDto(detail, inventoryInfo); // Gộp lại
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VariantDetailDto> getAllVariantsForBackfill() {
        // Gọi thẳng repository để lấy tất cả, không phân trang
        List<VehicleVariant> variants = variantRepository.findAll();

        // Map sang DTO
        return variants.stream()
                .map(this::mapToVariantDetailDto)
                .collect(Collectors.toList());
    }

    // ==========================================================
    // ============ FEATURE METHODS ============================
    // ==========================================================

    @Override
    public List<VehicleFeature> getAllFeatures() {
        return featureRepository.findAll();
    }

    @Override
    public Page<VehicleFeature> getAllFeaturesPaginated(String keyword, Pageable pageable) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return featureRepository.searchFeatures(keyword.trim(), pageable);
        }
        return featureRepository.findAll(pageable);
    }

    @Override
    @Transactional
    public VehicleVariant assignFeatureToVariant(Long variantId, FeatureRequest request, String updatedByEmail) {
        // Tìm variant và feature
        VehicleVariant variant = findVariantById(variantId);
        VehicleFeature feature = featureRepository.findById(request.getFeatureId())
                .orElseThrow(() -> new AppException(ErrorCode.FEATURE_NOT_FOUND));

        // Tạo đối tượng quan hệ VariantFeature
        VariantFeature variantFeature = new VariantFeature();
        variantFeature.setId(new VariantFeatureId(variantId, request.getFeatureId()));
        variantFeature.setVehicleVariant(variant);
        variantFeature.setVehicleFeature(feature);
        variantFeature.setStandard(request.isStandard());
        variantFeature.setAdditionalCost(request.getAdditionalCost());

        // Lưu lại quan hệ
        variantFeatureRepository.save(variantFeature);

        saveVariantHistory(variant, EVMAction.UPDATE, updatedByEmail); // Ghi lại lịch sử
        return variant;
    }

    @Override
    @Transactional
    public void unassignFeatureFromVariant(Long variantId, Long featureId, String updatedByEmail) {
        // Tìm variant để ghi lịch sử
        VehicleVariant variant = findVariantById(variantId);

        // Tạo ID tổng hợp để xóa
        VariantFeatureId id = new VariantFeatureId(variantId, featureId);
        if (!variantFeatureRepository.existsById(id)) {
            throw new AppException(ErrorCode.VARIANT_FEATURE_NOT_FOUND);
        }

        // Xóa quan hệ
        variantFeatureRepository.deleteById(id);

        saveVariantHistory(variant, EVMAction.UPDATE, updatedByEmail); // Ghi lại lịch sử
    }

    @Override
    @Transactional
    public VehicleFeature createFeature(CreateFeatureRequest request, String createdByEmail) {
        if (featureRepository.findByFeatureName(request.getFeatureName()).isPresent()) {
            throw new AppException(ErrorCode.FEATURE_ALREADY_EXISTS);
        }

        VehicleFeature newFeature = new VehicleFeature();
        newFeature.setFeatureName(request.getFeatureName());
        newFeature.setDescription(request.getDescription());
        newFeature.setCategory(request.getCategory());
        newFeature.setFeatureType(request.getFeatureType());

        return featureRepository.save(newFeature);
    }

    @Override
    @Transactional
    public VehicleFeature updateFeature(Long featureId, UpdateFeatureRequest request, String updatedByEmail) {
        VehicleFeature feature = featureRepository.findById(featureId)
                .orElseThrow(() -> new AppException(ErrorCode.FEATURE_NOT_FOUND));

        feature.setFeatureName(request.getFeatureName());
        feature.setDescription(request.getDescription());
        feature.setCategory(request.getCategory());
        feature.setFeatureType(request.getFeatureType());

        return featureRepository.save(feature);
    }

    @Override
    @Transactional
    public void deleteFeature(Long featureId, String deletedByEmail) {
        VehicleFeature feature = featureRepository.findById(featureId)
                .orElseThrow(() -> new AppException(ErrorCode.FEATURE_NOT_FOUND));

        boolean isAssigned = variantFeatureRepository.existsByVehicleFeature_FeatureId(featureId);
        if (isAssigned) {
            throw new AppException(ErrorCode.FEATURE_IS_ASSIGNED);
        }

        featureRepository.delete(feature);
    }

    @Override
    public List<FeatureVariantDto> getVariantsByFeatureId(Long featureId) {
        return variantFeatureRepository.findByVehicleFeature_FeatureId(featureId)
                .stream()
                .map(vf -> {
                    VehicleVariant variant = vf.getVehicleVariant();
                    return FeatureVariantDto.builder()
                            .variantId(variant.getVariantId())
                            .modelId(variant.getVehicleModel() != null ? variant.getVehicleModel().getModelId() : null)
                            .modelName(variant.getVehicleModel() != null ? variant.getVehicleModel().getModelName()
                                    : "N/A")
                            .versionName(variant.getVersionName())
                            .price(variant.getPrice())
                            .status(variant.getStatus())
                            .isStandard(vf.isStandard())
                            .additionalCost(vf.getAdditionalCost())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteModelsBulk(List<Long> modelIds, String deletedByEmail) {
        for (Long modelId : modelIds) {
            VehicleModel model = modelRepository.findById(modelId)
                    .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_MODEL_NOT_FOUND));

            if (!model.getVariants().isEmpty()) {
                throw new AppException(ErrorCode.MODEL_HAS_VARIANTS);
            }
            modelRepository.delete(model);
        }
    }

    @Override
    @Transactional
    public void deleteVariantsBulk(List<Long> variantIds, String deletedByEmail) {
        for (Long variantId : variantIds) {
            VehicleVariant variant = variantRepository.findById(variantId)
                    .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_VARIANT_NOT_FOUND));

            // Check if variant has dependencies that prevent deletion (e.g. in orders)
            // For now, we'll just delete it, assuming CascadeType.ALL handles internal
            // entities like features/history if configured, or we delete them manually.
            variantRepository.delete(variant);
        }
    }

    @Override
    @Transactional
    public void deleteFeaturesBulk(List<Long> featureIds, String deletedByEmail) {
        for (Long featureId : featureIds) {
            VehicleFeature feature = featureRepository.findById(featureId)
                    .orElseThrow(() -> new AppException(ErrorCode.FEATURE_NOT_FOUND));

            boolean isAssigned = variantFeatureRepository.existsByVehicleFeature_FeatureId(featureId);
            if (isAssigned) {
                throw new AppException(ErrorCode.FEATURE_IS_ASSIGNED);
            }
            featureRepository.delete(feature);
        }
    }

    // --- Helper Methods ---

    private VehicleModel findModelById(Long modelId) {
        return modelRepository.findById(modelId)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_MODEL_NOT_FOUND));
    }

    private VehicleVariant findVariantById(Long variantId) {
        return variantRepository.findById(variantId)
                .orElseThrow(() -> new AppException(ErrorCode.VEHICLE_VARIANT_NOT_FOUND));
    }

    private ModelSummaryDto mapToModelSummaryDto(VehicleModel model) {
        ModelSummaryDto dto = new ModelSummaryDto();
        dto.setModelId(model.getModelId());
        dto.setModelName(model.getModelName());
        dto.setBrand(model.getBrand());
        dto.setStatus(model.getStatus());
        dto.setThumbnailUrl(model.getThumbnailUrl());
        dto.setBaseRangeKm(model.getBaseRangeKm());
        dto.setBaseBatteryCapacity(model.getBaseBatteryCapacity());
        dto.setBaseChargingTime(model.getBaseChargingTime());
        dto.setBaseMotorPower(model.getBaseMotorPower());

        // Tìm giá thấp nhất từ các variants còn active
        BigDecimal minPrice = model.getVariants().stream()
                .filter(v -> v.getStatus() == VehicleStatus.IN_PRODUCTION || v.getStatus() == VehicleStatus.COMING_SOON)
                .filter(v -> v.getPrice() != null)
                .map(v -> v.getPrice())
                .min(BigDecimal::compareTo)
                .orElse(null);
        dto.setBasePrice(minPrice);

        return dto;
    }

    private ModelDetailDto mapToModelDetailDto(VehicleModel model) {
        ModelDetailDto dto = new ModelDetailDto();
        dto.setModelId(model.getModelId());
        dto.setModelName(model.getModelName());
        dto.setBrand(model.getBrand());
        dto.setStatus(model.getStatus());
        dto.setThumbnailUrl(model.getThumbnailUrl());

        // --- XỬ LÝ DỮ LIỆU HYBRID ---
        // Cập nhật các thông số cốt lõi
        dto.setBaseRangeKm(model.getBaseRangeKm());
        dto.setBaseMotorPower(model.getBaseMotorPower());
        dto.setBaseBatteryCapacity(model.getBaseBatteryCapacity());
        dto.setBaseChargingTime(model.getBaseChargingTime());

        // Cập nhật chuỗi JSON từ Map thông số mở rộng
        try {
            if (model.getExtendedSpecsJson() != null && !model.getExtendedSpecsJson().isEmpty()) {
                // Chuyển chuỗi JSON thành Map<String, Object>
                Map<String, Object> extendedSpecs = objectMapper.readValue(
                        model.getExtendedSpecsJson(),
                        new TypeReference<>() {
                        });
                dto.setExtendedSpecs(extendedSpecs);
            }
        } catch (Exception e) {
            throw new AppException(ErrorCode.INVALID_JSON_FORMAT);
        }

        dto.setVariants(model.getVariants().stream()
                .map(this::mapToVariantDetailDto)
                .collect(Collectors.toList()));
        return dto;
    }

    private VariantDetailDto mapToVariantDetailDto(VehicleVariant variant) {
        // Lấy đối tượng Model cha để sử dụng cho việc kế thừa
        VehicleModel model = variant.getVehicleModel();
        VariantDetailDto dto = new VariantDetailDto();

        // Ensure model is not null before accessing its properties
        if (model == null) {
            // Handle orphan variant case if necessary, or just basic mapping
            dto.setVariantId(variant.getVariantId());
            dto.setVersionName(variant.getVersionName());
            dto.setColor(variant.getColor());
            return dto;
        }

        // Map các thông tin cơ bản, không cần logic kế thừa
        dto.setVariantId(variant.getVariantId());
        dto.setVersionName(variant.getVersionName());
        dto.setModelId(model.getModelId());
        dto.setColor(variant.getColor());
        dto.setSkuCode(variant.getSkuCode());
        dto.setPrice(variant.getPrice());
        dto.setImageUrl((variant.getImageUrl() != null && !variant.getImageUrl().isBlank()) ? variant.getImageUrl()
                : model.getThumbnailUrl());
        dto.setStatus(variant.getStatus());
        dto.setWholesalePrice(variant.getWholesalePrice()); // Giá sỉ là của riêng variant, không kế thừa

        dto.setModelName(model.getModelName());
        dto.setBrand(model.getBrand());
        // ÁP DỤNG LOGIC KẾ THỪA VÀ GÁN MỘT LẦN DUY NHẤT
        // Xử lý Range: Ưu tiên variant, nếu không có thì lấy của model
        dto.setRangeKm(
                (variant.getRangeKm() != null) ? variant.getRangeKm() : model.getBaseRangeKm());

        // Xử lý Motor Power
        dto.setMotorPower(
                (variant.getMotorPower() != null) ? variant.getMotorPower() : model.getBaseMotorPower());

        // Xử lý Battery Capacity
        // Handle Integer to Double conversion explicitly
        dto.setBatteryCapacity(
                (variant.getBatteryCapacity() != null) ? variant.getBatteryCapacity()
                        : (model.getBaseBatteryCapacity() != null ? model.getBaseBatteryCapacity().doubleValue()
                                : null));

        // Xử lý Charging Time
        dto.setChargingTime(
                (variant.getChargingTime() != null) ? variant.getChargingTime() : model.getBaseChargingTime());

        // Map additional technical specifications (no inheritance from model)
        dto.setSeatingCapacity(variant.getSeatingCapacity());
        dto.setTorque(variant.getTorque());
        dto.setAcceleration(variant.getAcceleration());
        dto.setTopSpeed(variant.getTopSpeed());
        dto.setDimensions(variant.getDimensions());
        dto.setWeight(variant.getWeight());
        dto.setWarrantyYears(variant.getWarrantyYears());
        dto.setDescription(variant.getDescription());
        dto.setColorImages(variant.getColorImages());
        dto.setExteriorImages(variant.getExteriorImages());
        dto.setInteriorImages(variant.getInteriorImages());

        // Map các tính năng (features), logic này giữ nguyên
        if (variant.getFeatures() != null) {
            dto.setFeatures(variant.getFeatures().stream()
                    .map(this::mapToFeatureDto)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    private FeatureDto mapToFeatureDto(VariantFeature variantFeature) {
        FeatureDto dto = new FeatureDto();
        VehicleFeature feature = variantFeature.getVehicleFeature();

        if (feature != null) {
            dto.setFeatureId(feature.getFeatureId());
            dto.setFeatureName(feature.getFeatureName());
            dto.setCategory(feature.getCategory());
        }

        dto.setStandard(variantFeature.isStandard());
        dto.setAdditionalCost(variantFeature.getAdditionalCost());
        return dto;
    }

    private void saveVariantHistory(VehicleVariant variant, EVMAction action, String changedByEmail) {
        VehicleVariantHistory history = new VehicleVariantHistory();
        history.setVariantId(variant.getVariantId());
        history.setAction(action);
        history.setChangedBy(changedByEmail);
        history.setActionDate(LocalDateTime.now());

        // Snapshot dữ liệu
        history.setVersionName(variant.getVersionName());
        history.setColor(variant.getColor());
        history.setPrice(variant.getPrice());
        history.setStatus(variant.getStatus());

        variantHistoryRepository.save(history);
    }

    @Override
    public List<VariantDetailDto> getVariantsByModelId(Long modelId) {
        if (!modelRepository.existsById(modelId)) {
            throw new AppException(ErrorCode.VEHICLE_MODEL_NOT_FOUND);
        }

        List<VehicleVariant> variants = variantRepository.findByVehicleModel_ModelId(modelId);

        return variants.stream()
                .map(this::mapToVariantDetailDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getAllVariantIds() {
        // Gọi hàm repository mới (sẽ thêm ở bước 4)
        return variantRepository.findAllVariantIds();
    }

    /**
     * HÀM HELPER MỚI: Gọi sang inventory-service
     */
    private List<Long> getVariantIdsFromInventory(String status) {
        String inventoryUrl = inventoryServiceUrl + "/inventory/variants/ids-by-status?status=" + status;

        // Tạo HttpHeaders
        HttpHeaders headers = new HttpHeaders();

        // Lấy request hiện tại
        try {
            HttpServletRequest currentRequest = ((ServletRequestAttributes) RequestContextHolder
                    .currentRequestAttributes()).getRequest();

            // Sao chép các header cần thiết (Email, Role, v.v.)
            String email = currentRequest.getHeader("X-User-Email");
            String role = currentRequest.getHeader("X-User-Role");

            if (email != null)
                headers.set("X-User-Email", email);
            if (role != null)
                headers.set("X-User-Role", role);

        } catch (Exception e) {
            log.warn("Không thể lấy HttpServletRequest để chuyển tiếp header: {}", e.getMessage());

        }

        // Gói headers vào HttpEntity
        HttpEntity<String> requestEntity = new HttpEntity<>(headers);

        try {
            ResponseEntity<ApiRespond<List<Long>>> response = restTemplate.exchange(
                    inventoryUrl,
                    HttpMethod.GET,
                    requestEntity,
                    new ParameterizedTypeReference<ApiRespond<List<Long>>>() {
                    });

            if (response.getBody() != null && response.getBody().getData() != null) {
                return response.getBody().getData();
            }
        } catch (Exception e) {
            log.error("Không thể lấy ID từ inventory-service: {}", e.getMessage());
        }

        return Collections.emptyList();
    }

    @Override
    public List<PriceHistoryDto> getVariantPriceHistory(Long variantId) {
        return priceHistoryRepository.findByVehicleVariant_VariantIdOrderByChangeDateDesc(variantId)
                .stream()
                .map(price -> PriceHistoryDto.builder()
                        .priceId(price.getPriceId())
                        .oldPrice(price.getOldPrice())
                        .newPrice(price.getNewPrice())
                        .changeDate(price.getChangeDate())
                        .reason(price.getReason())
                        .changedBy(price.getChangedBy())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<VariantHistoryDto> getVariantAuditHistory(Long variantId) {
        return variantHistoryRepository.findByVariantIdOrderByActionDateDesc(variantId)
                .stream()
                .map(history -> VariantHistoryDto.builder()
                        .id(history.getId())
                        .variantId(history.getVariantId())
                        .action(history.getAction())
                        .actionDate(history.getActionDate())
                        .changedBy(history.getChangedBy())
                        .versionName(history.getVersionName())
                        .color(history.getColor())
                        .price(history.getPrice())
                        .status(history.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

}