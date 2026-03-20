package com.ev.vehicle_service.specification;

import com.ev.vehicle_service.model.VehicleVariant;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Join;
import com.ev.vehicle_service.model.*;

import java.util.List;

public class VehicleVariantSpecification {

    public static Specification<VehicleVariant> hasColor(String color) {
        return (root, query, cb) -> cb.like(cb.lower(root.get("color")), "%" + color.toLowerCase() + "%");
    }

    public static Specification<VehicleVariant> hasVersionName(String versionName) {
        return (root, query, cb) -> cb.like(cb.lower(root.get("versionName")), "%" + versionName.toLowerCase() + "%");
    }

    public static Specification<VehicleVariant> hasKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null; // Trả về null nếu không có gì để tìm
        }

        // Nếu có keyword, trả về Specification
        return (root, query, cb) -> {
            String likePattern = "%" + keyword.toLowerCase() + "%";
            Join<VehicleVariant, VehicleModel> modelJoin = root.join("vehicleModel");
            return cb.or(
                    cb.like(cb.lower(modelJoin.get("modelName")), likePattern),
                    cb.like(cb.lower(root.get("versionName")), likePattern),
                    cb.like(cb.lower(root.get("color")), likePattern),
                    cb.like(cb.lower(root.get("skuCode")), likePattern));
        };
    }

    /**
     * Lọc các variant có ID nằm trong danh sách được cung cấp.
     */
    public static Specification<VehicleVariant> hasVariantIdIn(List<Long> variantIds) {
        if (variantIds == null || variantIds.isEmpty()) {
            // Trả về một spec luôn sai (không trả về gì)
            return (root, query, cb) -> cb.disjunction();
        }
        // Trả về: WHERE variantId IN (id1, id2, ...)
        return (root, query, cb) -> root.get("variantId").in(variantIds);
    }

    /**
     * Specification để lọc giá lớn hơn hoặc bằng minPrice.
     */
    public static Specification<VehicleVariant> isPriceGreaterThanOrEqual(Double minPrice) {
        if (minPrice == null) {
            return null; // Bỏ qua nếu không có giá trị
        }
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice);
    }

    /**
     * Specification để lọc giá nhỏ hơn hoặc bằng maxPrice.
     */
    public static Specification<VehicleVariant> isPriceLessThanOrEqual(Double maxPrice) {
        if (maxPrice == null) {
            return null; // Bỏ qua nếu không có giá trị
        }
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice);
    }

}
