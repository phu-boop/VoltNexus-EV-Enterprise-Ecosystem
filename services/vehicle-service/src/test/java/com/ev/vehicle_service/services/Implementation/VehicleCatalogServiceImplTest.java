package com.ev.vehicle_service.services.Implementation;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.dto.inventory.InventoryComparisonDto;
import com.ev.common_lib.dto.vehicle.ComparisonDto;
import com.ev.common_lib.dto.vehicle.VariantDetailDto;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.common_lib.model.enums.VehicleStatus;
import com.ev.vehicle_service.dto.request.*;
import com.ev.vehicle_service.dto.response.ModelDetailDto;
import com.ev.vehicle_service.dto.response.ModelSummaryDto;
import com.ev.vehicle_service.model.*;
import com.ev.vehicle_service.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
class VehicleCatalogServiceImplTest {

    @Mock
    private VehicleModelRepository modelRepository;
    @Mock
    private VehicleVariantRepository variantRepository;
    @Mock
    private VehicleFeatureRepository featureRepository;
    @Mock
    private VariantFeatureRepository variantFeatureRepository;
    @Mock
    private PriceHistoryRepository priceHistoryRepository;
    @Mock
    private VehicleVariantHistoryRepository variantHistoryRepository;
    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;
    @Mock
    private ObjectMapper objectMapper;
    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private VehicleCatalogServiceImpl vehicleCatalogService;

    private VehicleModel model;
    private VehicleVariant variant;

    @BeforeEach
    void setUp() {
        model = new VehicleModel();
        model.setModelId(1L);
        model.setModelName("Model S");
        model.setBrand("Tesla");
        model.setStatus(VehicleStatus.IN_PRODUCTION);
        model.setVariants(new HashSet<>());

        variant = new VehicleVariant();
        variant.setVariantId(1L);
        variant.setVersionName("Long Range");
        variant.setPrice(BigDecimal.valueOf(80000));
        variant.setRangeKm(500);
        variant.setStatus(VehicleStatus.IN_PRODUCTION);
        variant.setVehicleModel(model);
        model.getVariants().add(variant);
    }

    @Nested
    @DisplayName("Model Retrieval Tests")
    class ModelRetrievalTests {

        @Test
        @DisplayName("Should return all models sorted")
        void getAllModels_ShouldReturnSortedList() {
            Sort sort = Sort.by(Sort.Direction.ASC, "modelName");
            when(modelRepository.findAll(sort)).thenReturn(List.of(model));

            List<ModelSummaryDto> result = vehicleCatalogService.getAllModels(sort);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getModelName()).isEqualTo("Model S");
        }

        @Test
        @DisplayName("Should return paginated models")
        void getAllModelsPaginated_ShouldReturnPage() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<VehicleModel> page = new PageImpl<>(List.of(model));
            when(modelRepository.findAll(pageable)).thenReturn(page);

            Page<ModelSummaryDto> result = vehicleCatalogService.getAllModelsPaginated(pageable);

            assertThat(result.getContent()).hasSize(1);
            verify(modelRepository).findAll(pageable);
        }

        @Test
        @DisplayName("Should return model details")
        void getModelDetails_WhenFound_ShouldReturnDto() {
            when(modelRepository.findModelWithDetailsById(1L)).thenReturn(Optional.of(model));

            ModelDetailDto result = vehicleCatalogService.getModelDetails(1L);

            assertThat(result.getModelName()).isEqualTo("Model S");
        }

        @Test
        @DisplayName("Should throw exception when model not found")
        void getModelDetails_WhenNotFound_ShouldThrowException() {
            when(modelRepository.findModelWithDetailsById(1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> vehicleCatalogService.getModelDetails(1L))
                    .isInstanceOf(AppException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.VEHICLE_MODEL_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("History Retrieval Tests")
    class HistoryRetrievalTests {
        @Test
        @DisplayName("Should return variant price history")
        void getVariantPriceHistory_ShouldReturnList() {
            when(priceHistoryRepository.findByVehicleVariant_VariantIdOrderByChangeDateDesc(1L))
                    .thenReturn(List.of(new PriceHistory()));

            List<com.ev.vehicle_service.dto.response.PriceHistoryDto> result = vehicleCatalogService
                    .getVariantPriceHistory(1L);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Should return variant audit history")
        void getVariantAuditHistory_ShouldReturnList() {
            when(variantHistoryRepository.findByVariantIdOrderByActionDateDesc(1L))
                    .thenReturn(List.of(new VehicleVariantHistory()));

            List<com.ev.vehicle_service.dto.response.VariantHistoryDto> result = vehicleCatalogService
                    .getVariantAuditHistory(1L);

            assertThat(result).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Model Search Tests")
    class ModelSearchTests {
        @Test
        @DisplayName("Should search models with keywords and filters")
        void searchModels_ShouldReturnFilteredResults() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<VehicleModel> page = new PageImpl<>(List.of(model));
            when(modelRepository.searchModels(anyString(), any(), eq(pageable))).thenReturn(page);

            Page<ModelSummaryDto> result = vehicleCatalogService.searchModels(
                    "Tesla", "AVAILABLE", BigDecimal.valueOf(70000), BigDecimal.valueOf(90000),
                    300, 600, pageable);

            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("Should handle search with various status strings")
        void searchModels_WithVariousStatus_ShouldWork() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<VehicleModel> page = new PageImpl<>(List.of(model));

            // Test "AVAILABLE" status (should map to IN_PRODUCTION)
            when(modelRepository.searchModels(any(), eq(VehicleStatus.IN_PRODUCTION), eq(pageable))).thenReturn(page);
            vehicleCatalogService.searchModels("keyword", "AVAILABLE", null, null, null, null, pageable);

            // Test invalid status (should map to null and log warn)
            reset(modelRepository);
            when(modelRepository.searchModels(any(), isNull(), eq(pageable))).thenReturn(page);
            vehicleCatalogService.searchModels("keyword", "INVALID_STATUS", null, null, null, null, pageable);

            verify(modelRepository).searchModels("keyword", null, pageable);
        }

        @Test
        @DisplayName("Should filter models by price when variants don't match")
        void searchModels_WhenPriceDoesNotMatch_ShouldReturnEmpty() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<VehicleModel> page = new PageImpl<>(List.of(model));
            when(modelRepository.searchModels(any(), any(), eq(pageable))).thenReturn(page);

            // Variants price is 80000. Filter for max 70000.
            Page<ModelSummaryDto> result = vehicleCatalogService.searchModels(
                    null, null, null, BigDecimal.valueOf(70000), null, null, pageable);

            assertThat(result.getContent()).isEmpty();
        }

        @Test
        @DisplayName("Should filter models by range from variants when baseRange is null")
        void searchModels_WhenBaseRangeIsNull_ShouldUseVariantRange() {
            model.setBaseRangeKm(null);
            variant.setRangeKm(500);
            Pageable pageable = PageRequest.of(0, 10);
            Page<VehicleModel> page = new PageImpl<>(List.of(model));
            when(modelRepository.searchModels(any(), any(), eq(pageable))).thenReturn(page);

            Page<ModelSummaryDto> result = vehicleCatalogService.searchModels(
                    null, null, null, null, 400, 600, pageable);

            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Management Operations Tests")
    class ManagementOperationsTests {
        @Test
        @DisplayName("Should create model with variants")
        void createModelWithVariants_ShouldSucceed() {
            CreateModelRequest request = new CreateModelRequest();
            request.setModelName("New Model");
            request.setVariants(new ArrayList<>());

            when(modelRepository.save(any(VehicleModel.class))).thenReturn(model);

            VehicleModel result = vehicleCatalogService.createModelWithVariants(request);

            assertThat(result).isNotNull();
            verify(modelRepository).save(any(VehicleModel.class));
        }

        @Test
        @DisplayName("Should create model with extended specs and features")
        void createModelWithVariants_WithFullData_ShouldSucceed() throws Exception {
            CreateModelRequest request = new CreateModelRequest();
            request.setModelName("Full Model");
            request.setExtendedSpecs(Map.of("Weight", "2000kg"));

            CreateVariantRequest vr = new CreateVariantRequest();
            vr.setVersionName("V1");
            FeatureRequest fr = new FeatureRequest();
            fr.setFeatureId(1L);
            fr.setStandard(true);
            vr.setFeatures(List.of(fr));
            request.setVariants(List.of(vr));

            when(modelRepository.save(any(VehicleModel.class))).thenReturn(model);
            when(variantRepository.save(any(VehicleVariant.class))).thenReturn(variant);
            when(featureRepository.findById(1L)).thenReturn(Optional.of(new VehicleFeature()));
            when(objectMapper.writeValueAsString(any())).thenReturn("{\"Weight\":\"2000kg\"}");

            vehicleCatalogService.createModelWithVariants(request);

            verify(variantFeatureRepository).save(any(VariantFeature.class));
            verify(objectMapper).writeValueAsString(request.getExtendedSpecs());
        }

        @Test
        @DisplayName("Should create variant for existing model")
        void createVariant_ShouldSucceed() {
            CreateVariantRequest request = new CreateVariantRequest();
            request.setVersionName("Standard");

            when(modelRepository.findById(1L)).thenReturn(Optional.of(model));
            when(variantRepository.save(any(VehicleVariant.class))).thenReturn(variant);

            VehicleVariant result = vehicleCatalogService.createVariant(1L, request, "admin@test.com");

            assertThat(result).isNotNull();
            verify(variantRepository).save(any(VehicleVariant.class));
        }

        @Test
        @DisplayName("Should update model details")
        void updateModel_ShouldSucceed() {
            UpdateModelRequest request = new UpdateModelRequest();
            request.setModelName("Updated Name");

            when(modelRepository.findById(1L)).thenReturn(Optional.of(model));
            when(modelRepository.save(any(VehicleModel.class))).thenReturn(model);

            VehicleModel result = vehicleCatalogService.updateModel(1L, request, "admin@test.com");

            assertThat(result.getModelName()).isEqualTo("Updated Name");
        }

        @Test
        @DisplayName("Should update variant price and record history")
        void updateVariant_WhenPriceChanges_ShouldRecordHistory() {
            UpdateVariantRequest request = new UpdateVariantRequest();
            request.setPrice(BigDecimal.valueOf(85000));
            request.setStatus(VehicleStatus.IN_PRODUCTION);
            request.setReason("Market inflation");

            when(variantRepository.findById(1L)).thenReturn(Optional.of(variant));
            when(variantRepository.save(any(VehicleVariant.class))).thenReturn(variant);

            vehicleCatalogService.updateVariant(1L, request, "admin@test.com");

            verify(priceHistoryRepository).save(any(PriceHistory.class));
            verify(kafkaTemplate).send(eq("product_events"), any());
        }

        @Test
        @DisplayName("Should update variant without price history when price is same")
        void updateVariant_WhenPriceSame_ShouldNotRecordHistory() {
            UpdateVariantRequest request = new UpdateVariantRequest();
            request.setPrice(variant.getPrice()); // Same price
            request.setStatus(VehicleStatus.IN_PRODUCTION);

            when(variantRepository.findById(1L)).thenReturn(Optional.of(variant));
            when(variantRepository.save(any(VehicleVariant.class))).thenReturn(variant);

            vehicleCatalogService.updateVariant(1L, request, "admin@test.com");

            verify(priceHistoryRepository, never()).save(any(PriceHistory.class));
        }

        @Test
        @DisplayName("Should handle Kafka failure during variant update")
        void updateVariant_WhenKafkaFails_ShouldStillSucceed() {
            UpdateVariantRequest request = new UpdateVariantRequest();
            request.setPrice(BigDecimal.valueOf(90000));

            when(variantRepository.findById(1L)).thenReturn(Optional.of(variant));
            when(variantRepository.save(any(VehicleVariant.class))).thenReturn(variant);
            lenient().when(kafkaTemplate.send(anyString(), any())).thenThrow(new RuntimeException("Kafka down"));

            VehicleVariant result = vehicleCatalogService.updateVariant(1L, request, "admin@test.com");

            assertThat(result).isNotNull();
            verify(variantRepository).save(variant);
        }

        @Test
        @DisplayName("Should deactivate model and all its variants")
        void deactivateModel_ShouldSucceed() {
            when(modelRepository.findById(1L)).thenReturn(Optional.of(model));

            vehicleCatalogService.deactivateModel(1L, true, "admin@test.com");

            assertThat(model.getStatus()).isEqualTo(VehicleStatus.DISCONTINUED);
            verify(modelRepository).save(model);
        }

        @Test
        @DisplayName("Should deactivate single variant")
        void deactivateVariant_ShouldSucceed() {
            when(variantRepository.findById(1L)).thenReturn(Optional.of(variant));

            vehicleCatalogService.deactivateVariant(1L, "admin@test.com");

            assertThat(variant.getStatus()).isEqualTo(VehicleStatus.DISCONTINUED);
            verify(variantRepository).save(variant);
        }
    }

    @Nested
    @DisplayName("Search and List Operations Tests")
    class SearchAndListOperationsTests {
        @Test
        @DisplayName("Should search variant IDs by criteria")
        void searchVariantIdsByCriteria_ShouldReturnIds() {
            when(variantRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class)))
                    .thenReturn(List.of(variant));

            List<Long> result = vehicleCatalogService.searchVariantIdsByCriteria("Tesla", "Red", "Long", null, null);

            assertThat(result).containsExactly(1L);
        }

        @Test
        @DisplayName("Should return paginated variants with filters")
        void getAllVariantsPaginated_ShouldReturnPage() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<VehicleVariant> page = new PageImpl<>(List.of(variant));
            when(variantRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), eq(pageable)))
                    .thenReturn(page);

            Page<VariantDetailDto> result = vehicleCatalogService.getAllVariantsPaginated(
                    "Tesla", "IN_PRODUCTION", 50000.0, 100000.0, null, pageable);

            assertThat(result.getContent()).hasSize(1);
        }
    }

    @Nested
    @DisplayName("Feature Management Tests")
    class FeatureManagementTests {
        @Test
        @DisplayName("Should create new feature if not exists")
        void createFeature_WhenNew_ShouldSucceed() {
            CreateFeatureRequest request = new CreateFeatureRequest();
            request.setFeatureName("Autopilot");

            when(featureRepository.findByFeatureName("Autopilot")).thenReturn(Optional.empty());
            when(featureRepository.save(any(VehicleFeature.class))).thenAnswer(i -> i.getArguments()[0]);

            VehicleFeature result = vehicleCatalogService.createFeature(request, "admin@test.com");

            assertThat(result.getFeatureName()).isEqualTo("Autopilot");
        }

        @Test
        @DisplayName("Should throw exception if feature name already exists")
        void createFeature_WhenExists_ShouldThrowException() {
            CreateFeatureRequest request = new CreateFeatureRequest();
            request.setFeatureName("Autopilot");

            when(featureRepository.findByFeatureName("Autopilot")).thenReturn(Optional.of(new VehicleFeature()));

            assertThatThrownBy(() -> vehicleCatalogService.createFeature(request, "admin@test.com"))
                    .isInstanceOf(AppException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.FEATURE_ALREADY_EXISTS);
        }

        @Test
        @DisplayName("Should assign feature to variant")
        void assignFeatureToVariant_ShouldSucceed() {
            FeatureRequest request = new FeatureRequest();
            request.setFeatureId(1L);
            request.setStandard(true);

            when(variantRepository.findById(1L)).thenReturn(Optional.of(variant));
            when(featureRepository.findById(1L)).thenReturn(Optional.of(new VehicleFeature()));

            vehicleCatalogService.assignFeatureToVariant(1L, request, "admin@test.com");

            verify(variantFeatureRepository).save(any(VariantFeature.class));
        }

        @Test
        @DisplayName("Should throw exception when deleting assigned feature")
        void deleteFeature_WhenAssigned_ShouldThrowException() {
            when(featureRepository.findById(1L)).thenReturn(Optional.of(new VehicleFeature()));
            when(variantFeatureRepository.existsByVehicleFeature_FeatureId(1L)).thenReturn(true);

            assertThatThrownBy(() -> vehicleCatalogService.deleteFeature(1L, "admin@test.com"))
                    .isInstanceOf(AppException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.FEATURE_IS_ASSIGNED);
        }

        @Test
        @DisplayName("Should delete feature successfully")
        void deleteFeature_ShouldSucceed() {
            when(featureRepository.findById(1L)).thenReturn(Optional.of(new VehicleFeature()));
            when(variantFeatureRepository.existsByVehicleFeature_FeatureId(1L)).thenReturn(false);

            vehicleCatalogService.deleteFeature(1L, "admin@test.com");

            verify(featureRepository).delete(any(VehicleFeature.class));
        }

        @Test
        @DisplayName("Should update feature successfully")
        void updateFeature_ShouldSucceed() {
            UpdateFeatureRequest request = new UpdateFeatureRequest();
            request.setFeatureName("New Name");
            when(featureRepository.findById(1L)).thenReturn(Optional.of(new VehicleFeature()));
            when(featureRepository.save(any(VehicleFeature.class))).thenAnswer(i -> i.getArguments()[0]);

            VehicleFeature result = vehicleCatalogService.updateFeature(1L, request, "admin@test.com");

            assertThat(result.getFeatureName()).isEqualTo("New Name");
        }

        @Test
        @DisplayName("Should unassign feature from variant")
        void unassignFeatureFromVariant_ShouldSucceed() {
            when(variantRepository.findById(1L)).thenReturn(Optional.of(variant));
            when(variantFeatureRepository.existsById(any())).thenReturn(true);

            vehicleCatalogService.unassignFeatureFromVariant(1L, 2L, "admin@test.com");

            verify(variantFeatureRepository).deleteById(any());
            verify(variantHistoryRepository).save(any());
        }

        @Test
        @DisplayName("Should throw exception when unassigning non-existing feature")
        void unassignFeatureFromVariant_WhenNotFound_ShouldThrowException() {
            when(variantRepository.findById(1L)).thenReturn(Optional.of(variant));
            when(variantFeatureRepository.existsById(any())).thenReturn(false);

            assertThatThrownBy(() -> vehicleCatalogService.unassignFeatureFromVariant(1L, 2L, "admin@test.com"))
                    .isInstanceOf(AppException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.VARIANT_FEATURE_NOT_FOUND);
        }
    }

    @Nested
    @DisplayName("Comparison Operations Tests")
    class ComparisonOperationsTests {
        @Test
        @DisplayName("Should merge vehicle details with inventory status")
        void getComparisonData_ShouldMergeData() {
            List<Long> ids = List.of(1L);
            UUID dealerId = UUID.randomUUID();
            HttpHeaders headers = new HttpHeaders();

            when(variantRepository.findAllWithDetailsByIds(ids)).thenReturn(List.of(variant));

            InventoryComparisonDto invDto = new InventoryComparisonDto();
            invDto.setVariantId(1L);
            invDto.setCentralStockAvailable(10);

            ApiRespond<List<InventoryComparisonDto>> apiRespond = new ApiRespond<>("200", "Success", List.of(invDto));
            ResponseEntity<ApiRespond<List<InventoryComparisonDto>>> response = new ResponseEntity<>(apiRespond,
                    HttpStatus.OK);

            when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(HttpEntity.class),
                    any(ParameterizedTypeReference.class))).thenReturn(response);

            List<ComparisonDto> result = vehicleCatalogService.getComparisonData(ids, dealerId, headers);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getInventory().getCentralStockAvailable()).isEqualTo(10);
        }

        @Test
        @DisplayName("Should throw exception when inventory service fails")
        void getComparisonData_WhenServiceFails_ShouldThrowException() {
            List<Long> ids = List.of(1L);
            when(variantRepository.findAllWithDetailsByIds(ids)).thenReturn(List.of(variant));
            when(restTemplate.exchange(anyString(), any(), any(), any(ParameterizedTypeReference.class)))
                    .thenThrow(new RuntimeException("Service down"));

            assertThatThrownBy(() -> vehicleCatalogService.getComparisonData(ids, UUID.randomUUID(), new HttpHeaders()))
                    .isInstanceOf(AppException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE);
        }

        @Test
        @DisplayName("Should handle missing attributes in request context during inventory fetch")
        @SuppressWarnings("unchecked")
        void getComparisonData_WhenNoRequest_ShouldStillWork() {
            List<Long> ids = List.of(1L);
            when(variantRepository.findAllWithDetailsByIds(ids)).thenReturn(List.of(variant));

            ApiRespond<List<InventoryComparisonDto>> apiRespond = new ApiRespond<>("200", "Success",
                    List.of(new InventoryComparisonDto()));
            ResponseEntity<ApiRespond<List<InventoryComparisonDto>>> response = new ResponseEntity<>(apiRespond,
                    HttpStatus.OK);
            when(restTemplate.exchange(anyString(), any(), any(), any(ParameterizedTypeReference.class)))
                    .thenReturn(response);

            // This triggers the catch block in headers forwarding if RequestContextHolder
            // is empty
            vehicleCatalogService.getComparisonData(ids, UUID.randomUUID(), null);

            verify(restTemplate).exchange(anyString(), any(), any(), any(ParameterizedTypeReference.class));
        }

        @Test
        @DisplayName("Should throw exception when mapping model details with invalid JSON")
        void getModelDetails_WithInvalidJson_ShouldThrowException() throws Exception {
            model.setExtendedSpecsJson("invalid");
            when(modelRepository.findModelWithDetailsById(1L)).thenReturn(Optional.of(model));
            when(objectMapper.readValue(anyString(), (TypeReference<Object>) any()))
                    .thenThrow(new RuntimeException("JSON error"));

            assertThatThrownBy(() -> vehicleCatalogService.getModelDetails(1L))
                    .isInstanceOf(AppException.class)
                    .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_JSON_FORMAT);
        }
    }

    @Nested
    @DisplayName("Inventory Integration Tests")
    class InventoryIntegrationTests {
        @Test
        @DisplayName("Should fetch variant IDs from inventory service")
        void getVariantIdsFromInventory_ShouldReturnIds() {
            ApiRespond<List<Long>> apiRespond = new ApiRespond<>("200", "Success", List.of(1L, 2L));
            ResponseEntity<ApiRespond<List<Long>>> response = new ResponseEntity<>(apiRespond, HttpStatus.OK);

            when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), any(HttpEntity.class),
                    any(ParameterizedTypeReference.class))).thenReturn(response);

            List<Long> result = ReflectionTestUtils.invokeMethod(vehicleCatalogService, "getVariantIdsFromInventory",
                    "AVAILABLE");

            assertThat(result).containsExactly(1L, 2L);
        }

        @Test
        @DisplayName("Should return empty list when inventory fetch fails")
        @SuppressWarnings("unchecked")
        void getVariantIdsFromInventory_WhenFetchFails_ShouldReturnEmptyList() {
            when(restTemplate.exchange(anyString(), any(), any(), any(ParameterizedTypeReference.class)))
                    .thenThrow(new RuntimeException("Fetch Error"));

            List<Long> result = ReflectionTestUtils.invokeMethod(vehicleCatalogService, "getVariantIdsFromInventory",
                    "AVAILABLE");

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should handle orphan variant case in mapping")
        void mapToVariantDetailDto_WithOrphanVariant_ShouldWork() {
            variant.setVehicleModel(null); // Orphan
            VariantDetailDto result = ReflectionTestUtils.invokeMethod(vehicleCatalogService, "mapToVariantDetailDto",
                    variant);
            assertThat(result.getVariantId()).isEqualTo(1L);
            assertThat(result.getModelName()).isNull();
        }
    }
}
