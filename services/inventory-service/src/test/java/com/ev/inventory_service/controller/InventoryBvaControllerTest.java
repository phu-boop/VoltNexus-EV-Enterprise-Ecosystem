package com.ev.inventory_service.controller;

import com.ev.common_lib.model.enums.TransactionType;
import com.ev.inventory_service.dto.request.CreateTransferRequestDto;
import com.ev.inventory_service.dto.request.TransactionRequestDto;
import com.ev.inventory_service.dto.request.UpdateReorderLevelRequest;
import com.ev.inventory_service.services.Interface.InventoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InventoryController.class)
@AutoConfigureMockMvc(addFilters = false) // Disable security for BVA validation testing
@DisplayName("Boundary Value Analysis (BVA) - Controller Validation Tests")
public class InventoryBvaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private InventoryService inventoryService;

    // ==========================================================
    // 1. UpdateReorderLevelRequest BVA Tests (@Min(0))
    // ==========================================================

    @Test
    @DisplayName("UpdateReorderLevel: reorderLevel = -1 (Invalid - Below Min)")
    void updateReorderLevel_MinMinusOne_ShouldReturnBadRequest() throws Exception {
        UpdateReorderLevelRequest request = new UpdateReorderLevelRequest();
        request.setVariantId(1L);
        request.setReorderLevel(-1);

        mockMvc.perform(put("/inventory/central-stock/reorder-level")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Email", "test@test.com")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("UpdateReorderLevel: reorderLevel = 0 (Valid - Min)")
    void updateReorderLevel_Min_ShouldReturnOk() throws Exception {
        UpdateReorderLevelRequest request = new UpdateReorderLevelRequest();
        request.setVariantId(1L);
        request.setReorderLevel(0);

        mockMvc.perform(put("/inventory/central-stock/reorder-level")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Email", "test@test.com")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("UpdateReorderLevel: reorderLevel = 1 (Valid - Min + 1)")
    void updateReorderLevel_MinPlusOne_ShouldReturnOk() throws Exception {
        UpdateReorderLevelRequest request = new UpdateReorderLevelRequest();
        request.setVariantId(1L);
        request.setReorderLevel(1);

        mockMvc.perform(put("/inventory/central-stock/reorder-level")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Email", "test@test.com")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    // ==========================================================
    // 2. TransactionRequestDto BVA Tests (@Min(1))
    // ==========================================================

    @Test
    @DisplayName("ExecuteTransaction: quantity = 0 (Invalid - Below Min)")
    void executeTransaction_MinMinusOne_ShouldReturnBadRequest() throws Exception {
        TransactionRequestDto request = new TransactionRequestDto();
        request.setTransactionType(TransactionType.RESTOCK);
        request.setVariantId(1L);
        request.setQuantity(0);

        mockMvc.perform(post("/inventory/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Email", "test@test.com")
                        .header("X-User-Role", "EVM_STAFF")
                        .header("X-User-ProfileId", UUID.randomUUID().toString())
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("ExecuteTransaction: quantity = 1 (Valid - Min)")
    void executeTransaction_Min_ShouldReturnOk() throws Exception {
        TransactionRequestDto request = new TransactionRequestDto();
        request.setTransactionType(TransactionType.RESTOCK);
        request.setVariantId(1L);
        request.setQuantity(1);

        mockMvc.perform(post("/inventory/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Email", "test@test.com")
                        .header("X-User-Role", "EVM_STAFF")
                        .header("X-User-ProfileId", UUID.randomUUID().toString())
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("ExecuteTransaction: quantity = 2 (Valid - Min + 1)")
    void executeTransaction_MinPlusOne_ShouldReturnOk() throws Exception {
        TransactionRequestDto request = new TransactionRequestDto();
        request.setTransactionType(TransactionType.RESTOCK);
        request.setVariantId(1L);
        request.setQuantity(2);

        mockMvc.perform(post("/inventory/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-User-Email", "test@test.com")
                        .header("X-User-Role", "EVM_STAFF")
                        .header("X-User-ProfileId", UUID.randomUUID().toString())
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    // ==========================================================
    // 3. CreateTransferRequestDto BVA Tests (@Min(1))
    // ==========================================================

    @Test
    @DisplayName("CreateTransfer: quantity = 0 (Invalid - Below Min)")
    void createTransfer_MinMinusOne_ShouldReturnBadRequest() throws Exception {
        CreateTransferRequestDto request = new CreateTransferRequestDto();
        request.setVariantId(1L);
        request.setQuantity(0);
        request.setToDealerId(UUID.randomUUID());
        request.setRequesterEmail("test@test.com");

        mockMvc.perform(post("/inventory/transfer-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("CreateTransfer: quantity = 1 (Valid - Min)")
    void createTransfer_Min_ShouldReturnOk() throws Exception {
        CreateTransferRequestDto request = new CreateTransferRequestDto();
        request.setVariantId(1L);
        request.setQuantity(1);
        request.setToDealerId(UUID.randomUUID());
        request.setRequesterEmail("test@test.com");

        mockMvc.perform(post("/inventory/transfer-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("CreateTransfer: quantity = 2 (Valid - Min + 1)")
    void createTransfer_MinPlusOne_ShouldReturnOk() throws Exception {
        CreateTransferRequestDto request = new CreateTransferRequestDto();
        request.setVariantId(1L);
        request.setQuantity(2);
        request.setToDealerId(UUID.randomUUID());
        request.setRequesterEmail("test@test.com");

        mockMvc.perform(post("/inventory/transfer-requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}
