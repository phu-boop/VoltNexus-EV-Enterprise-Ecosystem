package com.ev.ai_service.loader;

import com.ev.ai_service.client.DealerServiceClient;
import com.ev.ai_service.client.VehicleServiceClient;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KnowledgeBaseLoaderTest {

    @Mock
    private VectorStore vectorStore;
    @Mock
    private VehicleServiceClient vehicleServiceClient;
    @Mock
    private DealerServiceClient dealerServiceClient;

    @InjectMocks
    private KnowledgeBaseLoader knowledgeBaseLoader;

    @Test
    @DisplayName("Chạy loader thành công và thêm document vào VectorStore")
    void run_success() throws Exception {
        // Mock vehicle data
        VehicleServiceClient.VehicleVariantInfo v1 = new VehicleServiceClient.VehicleVariantInfo();
        v1.setVariantId(1L);
        v1.setVersionName("Standard");
        v1.setModelName("VF8");
        v1.setPrice(40000.0);
        when(vehicleServiceClient.getAllVariants()).thenReturn(List.of(v1));

        // Mock dealer data
        DealerServiceClient.DealerInfo d1 = new DealerServiceClient.DealerInfo();
        d1.setId(UUID.randomUUID());
        d1.setDealerName("Dealer A");
        d1.setCity("Hanoi");
        when(dealerServiceClient.getAllDealers()).thenReturn(List.of(d1));

        knowledgeBaseLoader.run();

        ArgumentCaptor<List<Document>> captor = ArgumentCaptor.forClass(List.class);
        verify(vectorStore).add(captor.capture());

        List<Document> addedDocs = captor.getValue();
        // 4 static policies + 1 vehicle + 1 dealer = 6 docs
        assertThat(addedDocs).hasSize(6);

        assertThat(addedDocs).anyMatch(doc -> doc.getText().contains("Chính sách bảo hành"));
        assertThat(addedDocs).anyMatch(doc -> doc.getText().contains("VF8 Standard"));
        assertThat(addedDocs).anyMatch(doc -> doc.getText().contains("40.000,00"));
        assertThat(addedDocs).anyMatch(doc -> doc.getText().contains("Dealer A"));
        assertThat(addedDocs).anyMatch(doc -> doc.getText().contains("Hanoi"));
    }

    @Test
    @DisplayName("Loader vẫn chạy và chỉ thêm static policies nếu tất cả service bị lỗi")
    void run_staticOnly_whenAllServicesFail() throws Exception {
        when(vehicleServiceClient.getAllVariants()).thenThrow(new RuntimeException("Error"));
        when(dealerServiceClient.getAllDealers()).thenThrow(new RuntimeException("Error"));

        knowledgeBaseLoader.run();

        ArgumentCaptor<List<Document>> captor = ArgumentCaptor.forClass(List.class);
        verify(vectorStore).add(captor.capture());
        assertThat(captor.getValue()).hasSize(4);
    }

    @Test
    @DisplayName("Loader vẫn chạy tiếp nếu một service bị lỗi")
    void run_partialSuccess_whenServiceFails() throws Exception {
        // Vehicle service fails
        when(vehicleServiceClient.getAllVariants()).thenThrow(new RuntimeException("Vehicle Service Down"));

        // Dealer service works
        DealerServiceClient.DealerInfo d1 = new DealerServiceClient.DealerInfo();
        d1.setId(UUID.randomUUID());
        d1.setDealerName("Dealer B");
        when(dealerServiceClient.getAllDealers()).thenReturn(List.of(d1));

        knowledgeBaseLoader.run();

        ArgumentCaptor<List<Document>> captor = ArgumentCaptor.forClass(List.class);
        verify(vectorStore).add(captor.capture());

        List<Document> addedDocs = captor.getValue();
        // 4 static policies + 0 vehicle + 1 dealer = 5 docs
        assertThat(addedDocs).hasSize(5);
        assertThat(addedDocs).anyMatch(doc -> doc.getText().contains("Dealer B"));
    }

    @Test
    @DisplayName("Load RAG thành công với đầy đủ dữ liệu xe và tính năng")
    void run_success_with_vehicle_features() throws Exception {
        VehicleServiceClient.VehicleVariantInfo variant = new VehicleServiceClient.VehicleVariantInfo();
        variant.setVariantId(1L);
        variant.setVersionName("Plus");
        variant.setModelName("VF8");
        variant.setPrice(50000.0);
        variant.setColor("Red");
        variant.setRangeKm(400);
        variant.setBatteryCapacity(82);
        variant.setDescription("High-end electric SUV");

        com.ev.common_lib.dto.vehicle.FeatureDto feature = new com.ev.common_lib.dto.vehicle.FeatureDto();
        feature.setFeatureName("ADASH");
        feature.setCategory("Safety");
        variant.setFeatures(List.of(feature));

        when(vehicleServiceClient.getAllVariants()).thenReturn(List.of(variant));
        when(dealerServiceClient.getAllDealers()).thenReturn(Collections.emptyList());

        knowledgeBaseLoader.run();

        ArgumentCaptor<List<Document>> captor = ArgumentCaptor.forClass(List.class);
        verify(vectorStore, atLeastOnce()).add(captor.capture());

        List<Document> savedDocs = captor.getValue();
        assertThat(savedDocs).hasSize(5); // 4 static + 1 vehicle

        Document vehicleDoc = savedDocs.stream()
                .filter(d -> d.getId().startsWith("vehicle_"))
                .findFirst().orElseThrow();

        assertThat(vehicleDoc.getText())
                .contains("Plus")
                .contains("ADASH")
                .contains("SUV")
                .contains("Safety");
    }

    @Test
    @DisplayName("Load RAG bỏ qua dealer không có ID")
    void run_skip_dealer_without_id() throws Exception {
        DealerServiceClient.DealerInfo dealer = new DealerServiceClient.DealerInfo();
        dealer.setDealerName("Ghost Dealer");
        dealer.setId(null);

        when(vehicleServiceClient.getAllVariants()).thenReturn(Collections.emptyList());
        when(dealerServiceClient.getAllDealers()).thenReturn(List.of(dealer));

        knowledgeBaseLoader.run();

        ArgumentCaptor<List<Document>> captor = ArgumentCaptor.forClass(List.class);
        verify(vectorStore, atLeastOnce()).add(captor.capture());

        assertThat(captor.getValue()).hasSize(4); // Only 4 static docs
    }
}
