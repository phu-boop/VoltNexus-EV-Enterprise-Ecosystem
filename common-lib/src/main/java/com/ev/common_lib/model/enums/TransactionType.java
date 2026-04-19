package com.ev.common_lib.model.enums;

/**
 * Enum này được dùng chung trong common-lib
 * để cả inventory-service và các service lắng nghe (như ai-service)
 * đều hiểu các loại giao dịch.
 */
public enum TransactionType {
    INITIAL_STOCK,      // Nhập kho lần đầu từ nhà sản xuất
    RESTOCK,            // Bổ sung hàng vào kho trung tâm
    TRANSFER_TO_DEALER, // Điều chuyển từ kho trung tâm đến đại lý
    TRANSFER_TO_CENTRAL,// Điều chuyển từ đại lý về kho trung tâm
    SALE,               // Bán hàng (trừ kho)
    ADJUSTMENT_ADD,     // Điều chỉnh tăng (kiểm kho)
    ADJUSTMENT_SUBTRACT, // Điều chỉnh giảm (kiểm kho)
    ALLOCATE,            // Giữ chỗ (phân bổ) hàng trong kho TT cho một đơn hàng
    RETURN_FROM_DEALER,
}