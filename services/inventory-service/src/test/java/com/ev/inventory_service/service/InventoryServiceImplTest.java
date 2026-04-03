package com.ev.inventory_service.service;

import com.ev.common_lib.dto.inventory.AllocationRequestDto;
import com.ev.common_lib.dto.inventory.ShipmentRequestDto;
import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.dto.vehicle.VariantDetailDto;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.common_lib.model.enums.TransactionType;
import com.ev.inventory_service.dto.request.TransactionRequestDto;
import com.ev.inventory_service.dto.request.CreateTransferRequestDto;
import com.ev.inventory_service.dto.request.UpdateReorderLevelRequest;
import com.ev.inventory_service.model.*;
import com.ev.inventory_service.model.Enum.VehiclePhysicalStatus;
import com.ev.inventory_service.repository.*;
import com.ev.inventory_service.services.Implementation.InventoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("InventoryServiceImpl Unit Tests")
@SuppressWarnings("unchecked")
class InventoryServiceImplTest {

    @Mock
    private CentralInventoryRepository centralRepo;
    @Mock
    private DealerAllocationRepository dealerRepo;
    @Mock
    private InventoryTransactionRepository transactionRepo;
    @Mock
    private StockAlertRepository stockAlertRepo;
    @Mock
    private PhysicalVehicleRepository physicalVehicleRepo;
    @Mock
    private TransferRequestRepository transferRepo;
    @Mock
    private RestTemplate restTemplate;
    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(inventoryService, "vehicleCatalogUrl", "http://vehicle-service");
        lenient().when(transactionRepo.save(any(InventoryTransaction.class))).thenAnswer(i -> i.getArgument(0));
        lenient().when(centralRepo.save(any(CentralInventory.class))).thenAnswer(i -> i.getArgument(0));
        lenient().when(dealerRepo.save(any(DealerAllocation.class))).thenAnswer(i -> i.getArgument(0));

        lenient().when(stockAlertRepo.save(any(StockAlert.class))).thenAnswer(i -> {
            StockAlert s = i.getArgument(0);
            s.setAlertId(100L);
            return s;
        });

        // Mock Catalog Service response for checkStockThresholdAndNotify enrichment
        var variantDetail = new VariantDetailDto();
        variantDetail.setVariantId(1L);
        variantDetail.setVersionName("Test Variant");
        variantDetail.setModelId(1L);
        variantDetail.setModelName("Test Model");

        ApiRespond<VariantDetailDto> apiRespond = ApiRespond.success("Success", variantDetail);

        lenient().when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.GET),
                isNull(),
                (ParameterizedTypeReference<Object>) any()))
                .thenReturn(ResponseEntity.ok(apiRespond));
    }

    @Nested
    @DisplayName("executeTransaction Tests")
    class ExecuteTransactionTests {

        @Test
        @DisplayName("RESTOCK: Should increase stock and create vehicles")
        void executeTransaction_RESTOCK_Success() {
            Long variantId = 1L;
            List<String> vins = List.of("VIN1", "VIN2");
            TransactionRequestDto request = new TransactionRequestDto();
            request.setTransactionType(TransactionType.RESTOCK);
            request.setVariantId(variantId);
            request.setVins(vins);
            request.setQuantity(2);

            CentralInventory inventory = new CentralInventory();
            inventory.setVariantId(variantId);
            inventory.setTotalQuantity(10);
            inventory.setAvailableQuantity(10);
            inventory.setAllocatedQuantity(0);

            when(centralRepo.findByVariantId(variantId)).thenReturn(Optional.of(inventory));
            when(physicalVehicleRepo.existsById(anyString())).thenReturn(false);
            when(physicalVehicleRepo.saveAll(anyList())).thenAnswer(i -> i.getArgument(0));

            inventoryService.executeTransaction(request, "staff@ev.com", "EVM_STAFF", "prof1");

            assertThat(inventory.getTotalQuantity()).isEqualTo(12);
            assertThat(inventory.getAvailableQuantity()).isEqualTo(12);
            verify(physicalVehicleRepo).saveAll(anyList());
            verify(kafkaTemplate, atLeastOnce()).send(anyString(), any());
        }

        @Test
        @DisplayName("ADJUSTMENT_ADD: Should increase stock")
        void executeTransaction_ADJUSTMENT_ADD_Success() {
            Long variantId = 1L;
            List<String> vins = List.of("VIN3");
            TransactionRequestDto request = new TransactionRequestDto();
            request.setTransactionType(TransactionType.ADJUSTMENT_ADD);
            request.setVariantId(variantId);
            request.setVins(vins);

            CentralInventory inventory = new CentralInventory();
            inventory.setVariantId(variantId);
            inventory.setTotalQuantity(10);
            inventory.setAvailableQuantity(10);
            inventory.setAllocatedQuantity(0);

            when(centralRepo.findByVariantId(variantId)).thenReturn(Optional.of(inventory));
            when(physicalVehicleRepo.existsById("VIN3")).thenReturn(false);
            when(physicalVehicleRepo.saveAll(anyList())).thenAnswer(i -> i.getArgument(0));

            inventoryService.executeTransaction(request, "staff@ev.com", "EVM_STAFF", "prof1");

            assertThat(inventory.getTotalQuantity()).isEqualTo(11);
            verify(physicalVehicleRepo).saveAll(anyList());
        }

        @Test
        @DisplayName("ADJUSTMENT_SUBTRACT: Should decrease stock and throw if insufficient")
        void executeTransaction_ADJUSTMENT_SUBTRACT_Insufficient() {
            Long variantId = 1L;
            List<String> vins = List.of("VIN1");
            TransactionRequestDto request = new TransactionRequestDto();
            request.setTransactionType(TransactionType.ADJUSTMENT_SUBTRACT);
            request.setVariantId(variantId);
            request.setVins(vins);

            CentralInventory inventory = new CentralInventory();
            inventory.setVariantId(variantId);
            inventory.setTotalQuantity(0);
            inventory.setAvailableQuantity(0);
            inventory.setAllocatedQuantity(0);

            PhysicalVehicle vehicle = new PhysicalVehicle();
            vehicle.setVin("VIN1");
            vehicle.setStatus(VehiclePhysicalStatus.IN_CENTRAL_WAREHOUSE);

            when(centralRepo.findByVariantId(variantId)).thenReturn(Optional.of(inventory));
            when(physicalVehicleRepo.findAllById(vins)).thenReturn(List.of(vehicle));

            assertThatThrownBy(() -> inventoryService.executeTransaction(request, "staff@ev.com", "EVM_STAFF", "prof1"))
                    .isInstanceOf(AppException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.INSUFFICIENT_STOCK);
        }

        @Test
        @DisplayName("ADJUSTMENT_SUBTRACT: Should decrease stock successfully")
        void executeTransaction_ADJUSTMENT_SUBTRACT_Success() {
            Long variantId = 1L;
            List<String> vins = List.of("VIN2");
            TransactionRequestDto request = new TransactionRequestDto();
            request.setTransactionType(TransactionType.ADJUSTMENT_SUBTRACT);
            request.setVariantId(variantId);
            request.setVins(vins);

            CentralInventory inventory = new CentralInventory();
            inventory.setVariantId(variantId);
            inventory.setTotalQuantity(10);
            inventory.setAvailableQuantity(10);
            inventory.setAllocatedQuantity(0);

            PhysicalVehicle vehicle = new PhysicalVehicle();
            vehicle.setVin("VIN2");
            vehicle.setStatus(VehiclePhysicalStatus.IN_CENTRAL_WAREHOUSE);

            when(centralRepo.findByVariantId(variantId)).thenReturn(Optional.of(inventory));
            when(physicalVehicleRepo.findAllById(vins)).thenReturn(List.of(vehicle));

            inventoryService.executeTransaction(request, "staff@ev.com", "EVM_STAFF", "prof1");

            assertThat(inventory.getTotalQuantity()).isEqualTo(9);
            assertThat(inventory.getAvailableQuantity()).isEqualTo(9);
            verify(physicalVehicleRepo).deleteAll(anyList());
        }

        @Test
        @DisplayName("executeTransaction(ADJUSTMENT_SUBTRACT) - Should throw if VIN not found")
        void executeTransaction_ADJUSTMENT_SUBTRACT_NotFound() {
            TransactionRequestDto request = new TransactionRequestDto();
            request.setTransactionType(TransactionType.ADJUSTMENT_SUBTRACT);
            request.setVins(List.of("MISSING"));
            request.setVariantId(1L);

            when(physicalVehicleRepo.findAllById(any())).thenReturn(List.of());

            assertThatThrownBy(() -> inventoryService.executeTransaction(request, "s@e.com", "ADMIN", "p1"))
                    .isInstanceOf(AppException.class);
        }

        @Test
        @DisplayName("executeTransaction(ADJUSTMENT_SUBTRACT) - Should throw if VIN status invalid")
        void executeTransaction_ADJUSTMENT_SUBTRACT_InvalidStatus() {
            TransactionRequestDto request = new TransactionRequestDto();
            request.setTransactionType(TransactionType.ADJUSTMENT_SUBTRACT);
            request.setVins(List.of("VIN_BAD"));
            request.setVariantId(1L);

            PhysicalVehicle v1 = new PhysicalVehicle();
            v1.setVin("VIN_BAD");
            v1.setStatus(VehiclePhysicalStatus.IN_TRANSIT);

            when(physicalVehicleRepo.findAllById(any())).thenReturn(List.of(v1));

            assertThatThrownBy(() -> inventoryService.executeTransaction(request, "s@e.com", "ADMIN", "p1"))
                    .isInstanceOf(AppException.class);
        }

        @Test
        @DisplayName("executeTransaction(DEFAULT) - Should throw BAD_REQUEST")
        void executeTransaction_Default_ThrowsBadRequest() {
            TransactionRequestDto request = new TransactionRequestDto();
            request.setTransactionType(TransactionType.SALE); // Not handled in switch but exists in enum

            assertThatThrownBy(() -> inventoryService.executeTransaction(request, "s@e.com", "ADMIN", "p1"))
                    .isInstanceOf(AppException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.BAD_REQUEST);
        }
    }

    @Nested
    @DisplayName("allocateStockForOrder Tests")
    class AllocateStockTests {
        @Test
        @DisplayName("Should allocate stock successfully")
        void allocateStockForOrder_Success() {
            UUID orderId = UUID.randomUUID();
            Long variantId = 1L;
            AllocationRequestDto request = new AllocationRequestDto();
            request.setOrderId(orderId);
            AllocationRequestDto.AllocationItem item = new AllocationRequestDto.AllocationItem();
            item.setVariantId(variantId);
            item.setQuantity(2);
            request.setItems(List.of(item));

            CentralInventory inventory = new CentralInventory();
            inventory.setVariantId(variantId);
            inventory.setAvailableQuantity(5);
            inventory.setAllocatedQuantity(0);

            when(centralRepo.findByVariantId(variantId)).thenReturn(Optional.of(inventory));

            inventoryService.allocateStockForOrder(request, "staff@ev.com");

            assertThat(inventory.getAllocatedQuantity()).isEqualTo(2);
            verify(centralRepo).save(inventory);
        }

        @Test
        @DisplayName("allocateStockForOrder - Should throw if stock not found")
        void allocateStockForOrder_NotFound() {
            AllocationRequestDto request = new AllocationRequestDto();
            AllocationRequestDto.AllocationItem item = new AllocationRequestDto.AllocationItem();
            item.setVariantId(99L);
            item.setQuantity(1);
            request.setItems(List.of(item));

            when(centralRepo.findByVariantId(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> inventoryService.allocateStockForOrder(request, "s@e.com"))
                    .isInstanceOf(AppException.class);
        }

        @Test
        @DisplayName("allocateStockForOrder - Should throw error if insufficient stock")
        void allocateStockForOrder_InsufficientStock() {
            AllocationRequestDto request = new AllocationRequestDto();
            AllocationRequestDto.AllocationItem item = new AllocationRequestDto.AllocationItem();
            item.setVariantId(1L);
            item.setQuantity(100);
            request.setItems(List.of(item));

            CentralInventory central = new CentralInventory();
            central.setAvailableQuantity(10);
            central.setAllocatedQuantity(0);

            when(centralRepo.findByVariantId(1L)).thenReturn(Optional.of(central));

            assertThatThrownBy(() -> inventoryService.allocateStockForOrder(request, "staff@ev.com"))
                    .isInstanceOf(AppException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.INSUFFICIENT_STOCK);
        }

        @Test
        @DisplayName("allocateStockForOrder - Should throw if quantity is negative or zero (edge case if logic allows)")
        void allocateStockForOrder_NegativeQuantity() {
            AllocationRequestDto request = new AllocationRequestDto();
            request.setOrderId(UUID.randomUUID());
            AllocationRequestDto.AllocationItem item = new AllocationRequestDto.AllocationItem();
            item.setVariantId(1L);
            item.setQuantity(0);
            request.setItems(List.of(item));

            CentralInventory central = new CentralInventory();
            central.setAvailableQuantity(10);
            central.setAllocatedQuantity(0);
            when(centralRepo.findByVariantId(1L)).thenReturn(Optional.of(central));

            inventoryService.allocateStockForOrder(request, "s@e.com");
            verify(centralRepo).save(central);
        }
    }

    @Nested
    @DisplayName("shipAllocatedStock Tests")
    class ShipAllocatedStockTests {
        @Test
        @DisplayName("Should ship allocated stock successfully")
        void shipAllocatedStock_Success() {
            UUID orderId = UUID.randomUUID();
            UUID dealerId = UUID.randomUUID();
            Long variantId = 1L;
            String vin = "VIN123";

            ShipmentRequestDto request = new ShipmentRequestDto();
            request.setOrderId(orderId);
            request.setDealerId(dealerId);
            ShipmentRequestDto.ShipmentItem item = new ShipmentRequestDto.ShipmentItem();
            item.setVariantId(variantId);
            item.setVins(List.of(vin));
            request.setItems(List.of(item));

            CentralInventory central = new CentralInventory();
            central.setVariantId(variantId);
            central.setAllocatedQuantity(1);
            central.setTotalQuantity(10);
            central.setAvailableQuantity(9);

            DealerAllocation allocation = new DealerAllocation();
            allocation.setDealerId(dealerId);
            allocation.setVariantId(variantId);
            allocation.setAvailableQuantity(0);
            allocation.setAllocatedQuantity(0);

            PhysicalVehicle vehicle = new PhysicalVehicle();
            vehicle.setVin(vin);
            vehicle.setStatus(VehiclePhysicalStatus.IN_CENTRAL_WAREHOUSE);

            when(centralRepo.findByVariantId(variantId)).thenReturn(Optional.of(central));
            when(dealerRepo.findByVariantIdAndDealerId(variantId, dealerId)).thenReturn(Optional.of(allocation));
            when(physicalVehicleRepo.findAllById(anyList())).thenReturn(List.of(vehicle));
            when(physicalVehicleRepo.saveAll(anyList())).thenAnswer(i -> i.getArgument(0));

            inventoryService.shipAllocatedStock(request, "staff@ev.com");

            assertThat(central.getAllocatedQuantity()).isZero();
            assertThat(allocation.getAvailableQuantity()).isEqualTo(1);
            assertThat(vehicle.getStatus()).isEqualTo(VehiclePhysicalStatus.AT_DEALER);
            verify(kafkaTemplate, atLeastOnce()).send(anyString(), any());
        }

        @Test
        @DisplayName("Should throw error if insufficient allocated quantity")
        void shipAllocatedStock_Insufficient() {
            ShipmentRequestDto request = new ShipmentRequestDto();
            ShipmentRequestDto.ShipmentItem item = new ShipmentRequestDto.ShipmentItem();
            item.setVariantId(1L);
            item.setVins(List.of("V1", "V2")); // Quantity = 2
            request.setItems(List.of(item));

            CentralInventory central = new CentralInventory();
            central.setAllocatedQuantity(1); // Only 1 allocated
            central.setAvailableQuantity(0);
            central.setTotalQuantity(1);

            when(centralRepo.findByVariantId(1L)).thenReturn(Optional.of(central));

            assertThatThrownBy(() -> inventoryService.shipAllocatedStock(request, "staff@ev.com"))
                    .isInstanceOf(AppException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.INSUFFICIENT_STOCK);
        }

        @Test
        @DisplayName("shipAllocatedStock - Should throw if VIN status not IN_CENTRAL_WAREHOUSE")
        void shipAllocatedStock_WrongVinStatus() {
            ShipmentRequestDto request = new ShipmentRequestDto();
            ShipmentRequestDto.ShipmentItem item = new ShipmentRequestDto.ShipmentItem();
            item.setVariantId(1L);
            item.setVins(List.of("VIN_BAD"));
            request.setItems(List.of(item));

            CentralInventory central = new CentralInventory();
            central.setAllocatedQuantity(1);
            central.setTotalQuantity(10);
            central.setAvailableQuantity(9);

            PhysicalVehicle v1 = new PhysicalVehicle();
            v1.setVin("VIN_BAD");
            v1.setStatus(VehiclePhysicalStatus.SOLD);

            when(centralRepo.findByVariantId(1L)).thenReturn(Optional.of(central));
            when(physicalVehicleRepo.findAllById(any())).thenReturn(List.of(v1));

            DealerAllocation da = new DealerAllocation();
            da.setAvailableQuantity(0);
            da.setAllocatedQuantity(0);
            when(dealerRepo.findByVariantIdAndDealerId(any(), any()))
                    .thenReturn(Optional.of(da));

            assertThatThrownBy(() -> inventoryService.shipAllocatedStock(request, "s@e.com"))
                    .isInstanceOf(AppException.class)
                    .extracting("errorCode")
                    .isEqualTo(ErrorCode.BAD_REQUEST);
        }
    }

    @Nested
    @DisplayName("returnStockForOrder Tests")
    class ReturnStockTests {
        @Test
        @DisplayName("Should return stock correctly")
        void returnStockForOrder_Success() {
            UUID orderId = UUID.randomUUID();
            PhysicalVehicle vehicle = new PhysicalVehicle();
            vehicle.setVin("VIN_RET");
            vehicle.setVariantId(1L);
            vehicle.setStatus(VehiclePhysicalStatus.AT_DEALER);

            CentralInventory central = new CentralInventory();
            central.setVariantId(1L);
            central.setTotalQuantity(10);
            central.setAvailableQuantity(10);
            central.setAllocatedQuantity(0);

            when(physicalVehicleRepo.findAllByOrderId(orderId)).thenReturn(List.of(vehicle));
            when(centralRepo.findByVariantId(1L)).thenReturn(Optional.of(central));

            inventoryService.returnStockForOrder(orderId, "staff@ev.com");

            assertThat(central.getTotalQuantity()).isEqualTo(11);
            assertThat(vehicle.getStatus()).isEqualTo(VehiclePhysicalStatus.IN_CENTRAL_WAREHOUSE);
            verify(physicalVehicleRepo).saveAll(anyList());
        }

    }

    @Test
    @DisplayName("updateCentralReorderLevel: Should update level successfully")
    void updateCentralReorderLevel_Success() {
        var request = new com.ev.inventory_service.dto.request.UpdateReorderLevelRequest();
        request.setVariantId(1L);
        request.setReorderLevel(20);

        CentralInventory inventory = new CentralInventory();
        inventory.setVariantId(1L);
        inventory.setReorderLevel(10);
        inventory.setAvailableQuantity(10);
        inventory.setTotalQuantity(10);
        inventory.setAllocatedQuantity(0);

        when(centralRepo.findByVariantId(1L)).thenReturn(Optional.of(inventory));

        inventoryService.updateCentralReorderLevel(request, "staff@ev.com");

        assertThat(inventory.getReorderLevel()).isEqualTo(20);
        verify(centralRepo).save(inventory);
    }

    @Test
    @DisplayName("checkStockThresholdAndNotify Tests")
    void checkStockThresholdAndNotify_CreateAlert() {
        Long variantId = 1L;
        CentralInventory inventory = new CentralInventory();
        inventory.setVariantId(variantId);
        inventory.setAvailableQuantity(5);
        inventory.setReorderLevel(10);

        when(centralRepo.findByVariantId(variantId)).thenReturn(Optional.of(inventory));
        when(stockAlertRepo.findFirstByVariantIdAndStatus(variantId, "NEW")).thenReturn(Optional.empty());
        // save
        // for
        // simplicity
        // or
        // test
        // the
        // branch

        VariantDetailDto details = new VariantDetailDto();
        details.setVersionName("V1");
        details.setSkuCode("SKU1");
        ApiRespond<VariantDetailDto> apiResponse = ApiRespond.success("Success", details);
        when(restTemplate.exchange(anyString(), any(HttpMethod.class), isNull(),
                (ParameterizedTypeReference<Object>) any()))
                .thenReturn(ResponseEntity.ok(apiResponse));

        ReflectionTestUtils.invokeMethod(inventoryService, "checkStockThresholdAndNotify", variantId);

        verify(stockAlertRepo).save(any(StockAlert.class));
        verify(kafkaTemplate).send(anyString(), any());
    }

    @Nested
    @DisplayName("getAllInventory Tests")
    class GetAllInventoryTests {
        @Test
        @DisplayName("Should returning paged inventory")
        void getAllInventory_Success() {
            Pageable pageable = PageRequest.of(0, 10);
            CentralInventory item = new CentralInventory();
            item.setVariantId(1L);
            Page<CentralInventory> page = new PageImpl<>(List.of(item));

            when(centralRepo.findAll((Specification<CentralInventory>) any(), any(Pageable.class))).thenReturn(page);

            var result = inventoryService.getAllInventory(null, null, null, null, null, pageable);

            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            verify(centralRepo).findAll((Specification<CentralInventory>) any(), any(Pageable.class));
        }

        @Test
        @DisplayName("Should return empty page if search returns no variants")
        void getAllInventory_SearchEmpty() {
            Pageable pageable = PageRequest.of(0, 10);
            ApiRespond<List<Long>> apiResponse = ApiRespond.success("Success", Collections.emptyList());
            when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), isNull(),
                    (ParameterizedTypeReference<Object>) any()))
                    .thenReturn(ResponseEntity.ok(apiResponse));

            var result = inventoryService.getAllInventory("NoSuchCar", null, null, null, null, pageable);

            assertThat(result.getContent()).isEmpty();
        }

        @Test
        @DisplayName("Should filter by dealerId")
        void getAllInventory_FilterByDealer() {
            UUID dealerId = UUID.randomUUID();
            Pageable pageable = PageRequest.of(0, 10);

            DealerAllocation allocation = new DealerAllocation();
            allocation.setVariantId(1L);

            when(dealerRepo.findByDealerId(dealerId)).thenReturn(List.of(allocation));
            when(centralRepo.findAll((Specification<CentralInventory>) any(), any(Pageable.class)))
                    .thenReturn(Page.empty());

            inventoryService.getAllInventory(null, dealerId, null, null, null, pageable);

            verify(dealerRepo).findByDealerId(dealerId);
            verify(centralRepo).findAll((Specification<CentralInventory>) any(), any(Pageable.class));
        }

        @Test
        @DisplayName("getAllInventory - Search throws exception")
        void getAllInventory_SearchError() {
            Pageable pageable = PageRequest.of(0, 10);
            when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), isNull(),
                    (ParameterizedTypeReference<Object>) any()))
                    .thenThrow(new RuntimeException("API Down"));

            var result = inventoryService.getAllInventory("Crash", null, null, null, null, pageable);
            assertThat(result.getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("createTransferRequest Tests")
    class TransferRequestTests {
        @Test
        @DisplayName("Should create transfer request successfully")
        void createTransferRequest_Success() {
            CreateTransferRequestDto request = new CreateTransferRequestDto();
            request.setVariantId(1L);
            request.setQuantity(5);
            request.setToDealerId(UUID.randomUUID());
            request.setRequesterEmail("requester@ev.com");

            CentralInventory central = new CentralInventory();
            central.setAvailableQuantity(10);
            central.setTotalQuantity(10);
            central.setAllocatedQuantity(0);

            when(centralRepo.findByVariantId(1L)).thenReturn(Optional.of(central));
            when(transferRepo.save(any(TransferRequest.class))).thenAnswer(i -> i.getArgument(0));

            inventoryService.createTransferRequest(request);

            verify(transferRepo).save(any(TransferRequest.class));
        }
    }

    @Test
    @DisplayName("updateDealerReorderLevel: Should update successfully")
    void updateDealerReorderLevel_Success() {
        UUID dealerId = UUID.randomUUID();
        UpdateReorderLevelRequest request = new UpdateReorderLevelRequest();
        request.setVariantId(1L);
        request.setReorderLevel(15);

        DealerAllocation allocation = new DealerAllocation();
        allocation.setDealerId(dealerId);
        allocation.setVariantId(1L);
        allocation.setReorderLevel(5);

        when(dealerRepo.findByVariantIdAndDealerId(1L, dealerId)).thenReturn(Optional.of(allocation));

        inventoryService.updateDealerReorderLevel(dealerId, request);

        assertThat(allocation.getReorderLevel()).isEqualTo(15);
        verify(dealerRepo).save(allocation);
    }

    @Nested
    @DisplayName("Report Generation Tests")
    class ReportGenerationTests {

        @Test
        @DisplayName("generateInventoryReport - Success")
        void generateInventoryReport_Success() throws Exception {
            LocalDate startDate = LocalDate.now().minusDays(7);
            LocalDate endDate = LocalDate.now();
            java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();

            InventoryTransaction t1 = new InventoryTransaction();
            t1.setTransactionId(1L);
            t1.setTransactionType(TransactionType.RESTOCK);
            t1.setQuantity(5);
            t1.setVariantId(1L);
            t1.setTransactionDate(LocalDateTime.now());
            t1.setStaffId("admin@ev.com");

            when(transactionRepo.findAllByTransactionDateBetween(any(), any()))
                    .thenReturn(List.of(t1));

            inventoryService.generateInventoryReport(out, startDate, endDate);

            assertThat(out.size()).isGreaterThan(0);
        }

        @Test
        @DisplayName("generatePdfReport - Success")
        void generatePdfReport_Success() throws Exception {
            LocalDate startDate = LocalDate.now().minusDays(7);
            LocalDate endDate = LocalDate.now();
            java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();

            InventoryTransaction t1 = new InventoryTransaction();
            t1.setTransactionId(1L);
            t1.setTransactionType(TransactionType.RESTOCK);
            t1.setQuantity(5);
            t1.setVariantId(1L);
            t1.setTransactionDate(LocalDateTime.now());
            t1.setStaffId("admin@ev.com");

            when(transactionRepo.findAllByTransactionDateBetween(any(), any()))
                    .thenReturn(List.of(t1));

            inventoryService.generatePdfReport(out, startDate, endDate);

            assertThat(out.size()).isGreaterThan(0);
        }
    }

    @Nested
    @DisplayName("Analytics and Summary Tests")
    class AnalyticsTests {
        @Test
        @DisplayName("getInventorySnapshotsForAnalytics - Success")
        void getInventorySnapshotsForAnalytics_Success() {
            DealerAllocation allocation = new DealerAllocation();
            allocation.setVariantId(1L);
            allocation.setAvailableQuantity(5);
            allocation.setAllocatedQuantity(2);

            VariantDetailDto detail = new VariantDetailDto();
            detail.setVariantId(1L);
            detail.setVersionName("V1");

            when(dealerRepo.findAll(any(Pageable.class)))
                    .thenReturn(new PageImpl<>(List.of(allocation)));
            when(restTemplate.exchange(anyString(), eq(HttpMethod.POST), any(),
                    (ParameterizedTypeReference<Object>) any()))
                    .thenReturn(ResponseEntity.ok(ApiRespond.success("Success", List.of(detail))));

            var result = inventoryService.getInventorySnapshotsForAnalytics(null, null, 10);

            assertThat(result).isNotEmpty();
            verify(dealerRepo).findAll(any(Pageable.class));
        }

        @Test
        @DisplayName("getVariantIdsByStatus - Success")
        void getVariantIdsByStatus_Success() {
            CentralInventory inventory = new CentralInventory();
            inventory.setVariantId(1L);
            inventory.setAvailableQuantity(0);
            inventory.setTotalQuantity(0);
            inventory.setAllocatedQuantity(0);

            when(centralRepo.findAll()).thenReturn(List.of(inventory));
            when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), isNull(),
                    (ParameterizedTypeReference<Object>) any()))
                    .thenReturn(ResponseEntity.ok(ApiRespond.success("Success", List.of(1L))));

            var result = inventoryService.getVariantIdsByStatus("OUT_OF_STOCK");

            assertThat(result).contains(1L);
        }

        @Test
        @DisplayName("getVariantIdsByStatus - IN_STOCK branch")
        void getVariantIdsByStatus_InStock() {
            CentralInventory inventory = new CentralInventory();
            inventory.setVariantId(1L);
            inventory.setAvailableQuantity(10);
            inventory.setReorderLevel(5);
            inventory.setTotalQuantity(10);
            inventory.setAllocatedQuantity(0);

            when(centralRepo.findAll()).thenReturn(List.of(inventory));
            when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), isNull(),
                    (ParameterizedTypeReference<Object>) any()))
                    .thenReturn(ResponseEntity.ok(ApiRespond.success("Success", List.of(1L))));

            var result = inventoryService.getVariantIdsByStatus("IN_STOCK");
            assertThat(result).contains(1L);
        }

        @Test
        @DisplayName("getVariantIdsByStatus - LOW_STOCK branch")
        void getVariantIdsByStatus_LowStock() {
            CentralInventory inventory = new CentralInventory();
            inventory.setVariantId(1L);
            inventory.setAvailableQuantity(3);
            inventory.setReorderLevel(5);
            inventory.setTotalQuantity(3);
            inventory.setAllocatedQuantity(0);

            when(centralRepo.findAll()).thenReturn(List.of(inventory));
            when(restTemplate.exchange(anyString(), eq(HttpMethod.GET), isNull(),
                    (ParameterizedTypeReference<Object>) any()))
                    .thenReturn(ResponseEntity.ok(ApiRespond.success("Success", List.of(1L))));

            var result = inventoryService.getVariantIdsByStatus("LOW_STOCK");
            assertThat(result).contains(1L);
        }
    }

    @Nested
    @DisplayName("Transaction History Tests")
    class HistoryTests {
        @Test
        @DisplayName("getTransactionHistory - With date filter")
        void getTransactionHistory_WithDates() {
            Pageable pageable = PageRequest.of(0, 10);
            LocalDate start = LocalDate.now();
            LocalDate end = LocalDate.now();

            when(transactionRepo.findAllByTransactionDateBetween(any(), any(),
                    any())).thenReturn(Page.empty());

            inventoryService.getTransactionHistory(start, end, pageable);

            verify(transactionRepo).findAllByTransactionDateBetween(any(), any(), any());
        }

        @Test
        @DisplayName("getTransactionHistory - Without dates")
        void getTransactionHistory_All() {
            Pageable pageable = PageRequest.of(0, 10);
            when(transactionRepo.findAll(any(Pageable.class))).thenReturn(Page.empty());

            inventoryService.getTransactionHistory(null, null, pageable);

            verify(transactionRepo).findAll(any(Pageable.class));
        }
    }

    @Nested
    @DisplayName("Shipment Validation Tests")
    class ShipmentValidationTests {
        @Test
        @DisplayName("validateVinsForShipment - Success")
        void validateVinsForShipment_AllValid() {
            List<String> vins = List.of("VIN1");
            PhysicalVehicle v1 = new PhysicalVehicle();
            v1.setVin("VIN1");
            v1.setStatus(VehiclePhysicalStatus.IN_CENTRAL_WAREHOUSE);

            when(physicalVehicleRepo.findAllById(vins)).thenReturn(List.of(v1));

            var result = inventoryService.validateVinsForShipment(vins);

            assertThat(result.getInvalidVins()).isEmpty();
            assertThat(result.getValidVins()).hasSize(1);
        }

        @Test
        @DisplayName("getAvailableVinsForVariant - Success")
        void getAvailableVinsForVariant_Success() {
            PhysicalVehicle v1 = new PhysicalVehicle();
            v1.setVin("VIN_AVAIL");
            when(physicalVehicleRepo.findByVariantIdAndStatus(1L, VehiclePhysicalStatus.IN_CENTRAL_WAREHOUSE))
                    .thenReturn(List.of(v1));

            var result = inventoryService.getAvailableVinsForVariant(1L);

            assertThat(result).contains("VIN_AVAIL");
        }
    }

    @Nested
    @DisplayName("Inventory Retrieval Tests")
    class RetrievalTests {
        @Test
        @DisplayName("getInventoryStatusByIds - Success")
        void getInventoryStatusByIds_Success() {
            List<Long> ids = List.of(1L);
            CentralInventory inventory = new CentralInventory();
            inventory.setVariantId(1L);
            inventory.setAvailableQuantity(5);
            inventory.setTotalQuantity(5);
            inventory.setAllocatedQuantity(0);

            when(centralRepo.findByVariantIdIn(ids)).thenReturn(List.of(inventory));

            var result = inventoryService.getInventoryStatusByIds(ids);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getAvailableQuantity()).isEqualTo(5);
        }

        @Test
        @DisplayName("getInventoryStatusByIds - Should return empty for empty input")
        void getInventoryStatusByIds_Empty() {
            var result = inventoryService.getInventoryStatusByIds(List.of());
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("getInventoryStatusByIds - Should return empty for null input")
        void getInventoryStatusByIds_Null() {
            var result = inventoryService.getInventoryStatusByIds(null);
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("getDealerInventory - Success")
        void getDealerInventory_Success() {
            UUID dealerId = UUID.randomUUID();
            DealerAllocation allocation = new DealerAllocation();
            allocation.setVariantId(1L);
            allocation.setAvailableQuantity(5);
            allocation.setAllocatedQuantity(0);

            VariantDetailDto detail = new VariantDetailDto();
            detail.setVariantId(1L);
            detail.setVersionName("V1");

            when(dealerRepo.findByDealerId(dealerId)).thenReturn(List.of(allocation));
            when(restTemplate.exchange(anyString(), any(HttpMethod.class), any(),
                    (ParameterizedTypeReference<Object>) any()))
                    .thenReturn(ResponseEntity.ok(ApiRespond.success("Success", List.of(detail))));

            var result = inventoryService.getDealerInventory(dealerId, null,
                    new org.springframework.http.HttpHeaders());

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("getDetailedInventoryByIds - Success")
        void getDetailedInventoryByIds_Success() {
            List<Long> ids = List.of(1L);
            UUID dealerId = UUID.randomUUID();

            CentralInventory central = new CentralInventory();
            central.setVariantId(1L);
            central.setAvailableQuantity(10);
            central.setTotalQuantity(10);
            central.setAllocatedQuantity(0);

            DealerAllocation dealer = new DealerAllocation();
            dealer.setVariantId(1L);
            dealer.setAvailableQuantity(2);
            dealer.setAllocatedQuantity(0);

            when(centralRepo.findByVariantIdIn(ids)).thenReturn(List.of(central));
            when(dealerRepo.findByVariantIdInAndDealerId(ids, dealerId)).thenReturn(List.of(dealer));

            var result = inventoryService.getDetailedInventoryByIds(ids, dealerId);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getCentralStockAvailable()).isEqualTo(10);
            assertThat(result.get(0).getDealerStockAvailable()).isEqualTo(2);
        }
    }

    @Nested
    @DisplayName("getInventoryStatusForVariant Tests")
    class GetInventoryStatusForVariantTests {
        @Test
        @DisplayName("getInventoryStatusForVariant - Success returns combined Dto")
        void getInventoryStatusForVariant_Success() {
            CentralInventory c1 = new CentralInventory();
            c1.setVariantId(1L);
            c1.setTotalQuantity(10);
            c1.setAvailableQuantity(8);
            c1.setAllocatedQuantity(2);

            DealerAllocation d1 = new DealerAllocation();
            d1.setDealerId(UUID.randomUUID());
            d1.setVariantId(1L);
            d1.setAllocatedQuantity(2);
            d1.setAvailableQuantity(1);

            when(centralRepo.findByVariantId(1L)).thenReturn(Optional.of(c1));
            when(dealerRepo.findByVariantId(1L)).thenReturn(List.of(d1));

            com.ev.inventory_service.dto.response.InventoryStatusDto dto = inventoryService
                    .getInventoryStatusForVariant(1L);

            assertThat(dto).isNotNull();
            assertThat(dto.getAvailableQuantity()).isEqualTo(8);
        }

        @Test
        @DisplayName("getInventoryStatusForVariant - Should return empty DTO if central not found")
        void getInventoryStatusForVariant_NotFound() {
            when(centralRepo.findByVariantId(anyLong())).thenReturn(Optional.empty());

            var dto = inventoryService.getInventoryStatusForVariant(1L);

            assertThat(dto.getTotalQuantity()).isZero();
            assertThat(dto.getStatus()).isEqualTo(com.ev.common_lib.model.enums.InventoryLevelStatus.OUT_OF_STOCK);
        }
    }
}
