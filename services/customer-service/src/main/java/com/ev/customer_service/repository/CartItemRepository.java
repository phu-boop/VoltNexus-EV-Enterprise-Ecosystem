package com.ev.customer_service.repository;

import com.ev.customer_service.entity.CartItem;
import com.ev.customer_service.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    /**
     * Tìm tất cả cart items của một customer
     */
    List<CartItem> findByCustomerCustomerId(Long customerId);

    /**
     * Tìm tất cả cart items của một customer (ordered by created date)
     */
    List<CartItem> findByCustomerCustomerIdOrderByCreatedAtDesc(Long customerId);

    /**
     * Tìm cart item cụ thể của customer với variant ID
     */
    Optional<CartItem> findByCustomerCustomerIdAndVariantId(Long customerId, Long variantId);

    /**
     * Kiểm tra xem customer đã có variant này trong giỏ hàng chưa
     */
    boolean existsByCustomerCustomerIdAndVariantId(Long customerId, Long variantId);

    /**
     * Đếm số lượng items trong giỏ hàng của customer
     */
    @Query("SELECT COUNT(c) FROM CartItem c WHERE c.customer.customerId = :customerId")
    Long countByCustomerId(@Param("customerId") Long customerId);

    /**
     * Xóa tất cả cart items của một customer
     */
    void deleteByCustomerCustomerId(Long customerId);

    /**
     * Xóa cart item của customer với variant ID
     */
    void deleteByCustomerCustomerIdAndVariantId(Long customerId, Long variantId);
}
