package com.ev.inventory_service.specification;

import com.ev.inventory_service.model.CentralInventory;
import org.springframework.data.jpa.domain.Specification;
import java.util.List;

public class InventorySpecification {
    /**
     * Tạo một Specification để tìm các inventory có variantId nằm trong một danh sách.
     * @param variantIds Danh sách các ID của variant.
     * @return Specification
     */
    public static Specification<CentralInventory> hasVariantIdIn(List<Long> variantIds) {
        return (root, query, criteriaBuilder) -> {
            if (variantIds == null || variantIds.isEmpty()) {
                // Trả về một điều kiện luôn sai nếu không có ID nào, để không trả về kết quả nào.
                return criteriaBuilder.disjunction(); 
            }
            // Trả về điều kiện `variantId IN (id1, id2, ...)`
            return root.get("variantId").in(variantIds);
        };
    }
}
