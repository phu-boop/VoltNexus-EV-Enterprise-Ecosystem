package com.ev.ai_service.loader;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;

import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class KnowledgeBaseLoader implements CommandLineRunner {

    private final VectorStore vectorStore;
    private final com.ev.ai_service.client.VehicleServiceClient vehicleServiceClient;
    private final com.ev.ai_service.client.DealerServiceClient dealerServiceClient;
    private static final String METADATA_SOURCE = "source";
    private static final String STATIC_POLICY_SOURCE = "static_policy";

    @Override
    public void run(String... args) {
        try {
            log.info("Loading Knowledge Base into Redis Vector Store...");

            List<Document> allDocuments = new java.util.ArrayList<>();
            allDocuments.addAll(getStaticPolicyDocuments());
            allDocuments.addAll(getVehicleDocuments());
            allDocuments.addAll(getDealerDocuments());

            if (allDocuments.isEmpty()) {
                log.warn("No documents generated for Knowledge Base.");
                return;
            }

            log.info("Adding {} documents to Vector Store...", allDocuments.size());
            vectorStore.add(allDocuments);
            log.info("Knowledge Base loaded to Redis! Added {} documents.", allDocuments.size());

        } catch (Throwable t) {
            log.error("FATAL ERROR in KnowledgeBaseLoader: {}. Application continues but RAG might be incomplete.",
                    t.getMessage(), t);
        }
    }

    private List<Document> getStaticPolicyDocuments() {
        return List.of(
                new Document("policy_warranty",
                        "Chính sách bảo hành: 10 năm cho pin, 10 năm cho xe. Cao nhất thị trường. Thay thế pin nếu dung lượng dưới 70%.",
                        Map.of(METADATA_SOURCE, STATIC_POLICY_SOURCE)),
                new Document("policy_maintenance",
                        "Lịch bảo dưỡng: Mỗi 12,000 km hoặc 1 năm. Miễn phí công thợ cho lần bảo dưỡng đầu tiên.",
                        Map.of(METADATA_SOURCE, STATIC_POLICY_SOURCE)),
                new Document("policy_charging",
                        "Mạng lưới trạm sạc: Truy cập trạm sạc V-Green toàn quốc, cùng các đối tác. Sạc tại nhà 7.2kW tặng kèm với VF9.",
                        Map.of(METADATA_SOURCE, STATIC_POLICY_SOURCE)),
                new Document("policy_sales",
                        "Chính sách bán hàng: Hoàn tiền trong 7 ngày nếu không hài lòng (giới hạn số km đã đi).",
                        Map.of(METADATA_SOURCE, STATIC_POLICY_SOURCE)));
    }

    private List<Document> getVehicleDocuments() {
        List<Document> docs = new java.util.ArrayList<>();
        try {
            var variants = vehicleServiceClient.getAllVariants();
            if (variants.isEmpty()) {
                log.warn("No vehicle variants found. Skipping vehicle data.");
                return docs;
            }

            log.info("Fetched {} vehicle variants from Vehicle Service.", variants.size());
            for (var v : variants) {
                String docContent = buildVehicleDocContent(v);
                String stableId = "vehicle_" + v.getVariantId();
                docs.add(new Document(stableId, docContent,
                        Map.of(METADATA_SOURCE, "vehicle_service", "variant_id", v.getVariantId())));
            }
        } catch (Exception e) {
            log.error("Failed to fetch vehicle data: {}", e.getMessage());
        }
        return docs;
    }

    private String buildVehicleDocContent(com.ev.ai_service.client.VehicleServiceClient.VehicleVariantInfo v) {
        StringBuilder sb = new StringBuilder();
        sb.append("Thông số kỹ thuật xe: ").append(v.getModelName()).append(" ").append(v.getVariantName())
                .append("\n");

        if (v.getPrice() != null)
            sb.append("- Giá niêm yết: $").append(String.format("%,.2f", v.getPrice())).append("\n");
        if (v.getColor() != null && !v.getColor().equalsIgnoreCase("N/A"))
            sb.append("- Màu sắc: ").append(v.getColor()).append("\n");
        if (v.getRangeKm() != null && v.getRangeKm() > 0)
            sb.append("- Tầm hoạt động: ").append(v.getRangeKm()).append(" km\n");
        if (v.getBatteryCapacity() != null && v.getBatteryCapacity() > 0)
            sb.append("- Dung lượng pin: ").append(v.getBatteryCapacity()).append(" kWh\n");
        if (v.getDescription() != null && !v.getDescription().isBlank())
            sb.append("- Mô tả: ").append(v.getDescription()).append("\n");

        appendFeatures(sb, v);
        return sb.toString();
    }

    private void appendFeatures(StringBuilder sb, com.ev.ai_service.client.VehicleServiceClient.VehicleVariantInfo v) {
        if (v.getFeatures() == null || v.getFeatures().isEmpty())
            return;

        sb.append("- Tính năng nổi bật: ");
        String featureList = v.getFeatures().stream()
                .map(f -> f.getFeatureName() + " (" + f.getCategory() + ")")
                .reduce((a, b) -> a + ", " + b)
                .orElse("");
        sb.append(featureList).append("\n");
    }

    private List<Document> getDealerDocuments() {
        List<Document> docs = new java.util.ArrayList<>();
        try {
            var dealers = dealerServiceClient.getAllDealers();
            if (dealers.isEmpty()) {
                log.warn("No dealers found. Skipping dealer data.");
                return docs;
            }

            log.info("Fetched {} dealers from Dealer Service.", dealers.size());
            for (var d : dealers) {
                if (d.getId() == null) {
                    log.warn("Skipping dealer with null ID: {}", d.getDealerName());
                    continue;
                }
                String docContent = buildDealerDocContent(d);
                String stableId = "dealer_" + d.getId();
                docs.add(new Document(stableId, docContent, Map.of(
                        METADATA_SOURCE, "dealer_service",
                        "dealer_id", d.getId().toString(),
                        "type", "dealer")));
            }
        } catch (Exception e) {
            log.error("Failed to fetch dealer data: {}", e.getMessage());
        }
        return docs;
    }

    private String buildDealerDocContent(com.ev.ai_service.client.DealerServiceClient.DealerInfo d) {
        StringBuilder sb = new StringBuilder();
        sb.append("Thông tin đại lý: ").append(d.getDealerName()).append("\n");
        if (d.getAddress() != null)
            sb.append("- Địa chỉ: ").append(d.getAddress()).append("\n");
        if (d.getCity() != null)
            sb.append("- Thành phố: ").append(d.getCity()).append("\n");
        if (d.getRegion() != null)
            sb.append("- Khu vực: ").append(d.getRegion()).append("\n");
        if (d.getPhoneNumber() != null)
            sb.append("- Số điện thoại: ").append(d.getPhoneNumber()).append("\n");
        if (d.getEmail() != null)
            sb.append("- Email: ").append(d.getEmail()).append("\n");
        return sb.toString();
    }
}
