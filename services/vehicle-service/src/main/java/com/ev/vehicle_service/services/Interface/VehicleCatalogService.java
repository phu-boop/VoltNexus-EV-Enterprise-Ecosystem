package com.ev.vehicle_service.services.Interface;

import com.ev.common_lib.dto.vehicle.VariantDetailDto;
import com.ev.common_lib.dto.vehicle.ComparisonDto;
// import com.ev.vehicle_service.dto.request.CreateVariantRequest;
import com.ev.vehicle_service.dto.request.CreateModelRequest;
import com.ev.vehicle_service.dto.request.CreateVariantRequest;
import com.ev.vehicle_service.dto.request.UpdateVariantRequest;
import com.ev.vehicle_service.dto.request.UpdateModelRequest;
import com.ev.vehicle_service.dto.request.CreateFeatureRequest;
import com.ev.vehicle_service.dto.request.UpdateFeatureRequest;
import com.ev.vehicle_service.dto.request.FeatureRequest;
import com.ev.vehicle_service.dto.response.ModelDetailDto;
import com.ev.vehicle_service.dto.response.ModelSummaryDto;
import com.ev.vehicle_service.model.VehicleModel;
import com.ev.vehicle_service.model.VehicleVariant;
import com.ev.vehicle_service.model.VehicleFeature;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;

import java.util.List;
import java.util.UUID;

public interface VehicleCatalogService {

    List<ModelSummaryDto> getAllModels(Sort sort);

    /**
     * Get all models with pagination - OPTIMIZED
     */
    Page<ModelSummaryDto> getAllModelsPaginated(Pageable pageable);

    /**
     * Search models with filters - OPTIMIZED
     */
    Page<ModelSummaryDto> searchModels(
            String keyword,
            String status,
            java.math.BigDecimal minPrice,
            java.math.BigDecimal maxPrice,
            Integer minRange,
            Integer maxRange,
            Pageable pageable);

    /**
     * Lấy TẤT CẢ ID của các phiên bản (không phân trang)
     */
    List<Long> getAllVariantIds();

    ModelDetailDto getModelDetails(Long modelId);

    VariantDetailDto getVariantDetails(Long variantId);

    VehicleModel createModelWithVariants(CreateModelRequest request); // Tạo 1 mẫu xe mới (có thể thêm 1 vài phiên bản
                                                                      // đi kèm theo)

    VehicleVariant createVariant(Long modelId, CreateVariantRequest request, String createdByEmail); // Tạo phiên bản xe
                                                                                                     // mới

    VehicleModel updateModel(Long modelId, UpdateModelRequest request, String updatedByEmail);

    VehicleVariant updateVariant(Long variantId, UpdateVariantRequest request, String updatedByEmail);

    void deactivateModel(Long modelId, String updatedByEmail);

    void deactivateVariant(Long variantId, String updatedByEmail);

    List<Long> searchVariantIdsByCriteria(String keyword, String color, String versionName);

    // --- Methods for Features ---
    List<VehicleFeature> getAllFeatures();

    // Gán tính năng cho variant
    VehicleVariant assignFeatureToVariant(Long variantId, FeatureRequest request, String updatedByEmail);

    // Gỡ tính năng cho variant
    void unassignFeatureFromVariant(Long variantId, Long featureId, String updatedByEmail);

    /**
     * Tạo một tính năng mới (chưa gán cho variant nào).
     */
    VehicleFeature createFeature(CreateFeatureRequest request, String createdByEmail);

    /**
     * Cập nhật thông tin của một tính năng.
     */
    VehicleFeature updateFeature(Long featureId, UpdateFeatureRequest request, String updatedByEmail);

    /**
     * Xóa một tính năng khỏi hệ thống.
     * (chỉ nên xóa nếu chưa được gán).
     */
    void deleteFeature(Long featureId, String deletedByEmail);

    // ---------------------------

    List<VariantDetailDto> getVariantDetailsByIds(List<Long> variantIds);

    /**
     * Lấy phiên bản xe để so sánh
     */
    List<ComparisonDto> getComparisonData(List<Long> variantIds, UUID dealerId, HttpHeaders headers);

    // Lấy tất cả phiên bản xe cho report
    List<VariantDetailDto> getAllVariantsForBackfill();

    // Lấy phiên bản từ modelID
    List<VariantDetailDto> getVariantsByModelId(Long modelId);

    /**
     * Triển khai logic cho API phân trang/tìm kiếm
     *
     * @param search   (MỚI) Từ khóa tìm kiếm
     * @param status   (MỚI) Lọc theo trạng thái tồn kho
     * @param minPrice (MỚI) Lọc theo giá tối thiểu
     * @param maxPrice (MỚI) Lọc theo giá tối đa
     */
    Page<VariantDetailDto> getAllVariantsPaginated(String search, String status, Double minPrice, Double maxPrice,
            Pageable pageable);
}
