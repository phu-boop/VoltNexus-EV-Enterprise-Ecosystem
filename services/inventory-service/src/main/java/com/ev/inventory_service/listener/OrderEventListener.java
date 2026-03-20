// package com.ev.inventory_service.listener;

// import com.ev.inventory_service.dto.event.OrderConfirmedEvent;
// import com.ev.inventory_service.dto.request.TransactionRequestDto;
// import com.ev.inventory_service.model.Enum.TransactionType;
// import com.ev.inventory_service.services.Interface.InventoryService;
// import lombok.RequiredArgsConstructor;
// import org.springframework.kafka.annotation.KafkaListener;
// import org.springframework.stereotype.Component;

// @Component
// @RequiredArgsConstructor
// public class OrderEventListener {

//     private final InventoryService inventoryService;

//     // Lắng nghe các sự kiện từ topic 'order-confirmed'
//     @KafkaListener(topics = "order-confirmed-topic", groupId = "inventory-group")
//     public void handleOrderConfirmed(OrderConfirmedEvent event) {

//         // 1. Tạo một yêu cầu giao dịch kho từ thông tin sự kiện
//         TransactionRequestDto saleTransaction = new TransactionRequestDto();
//         saleTransaction.setTransactionType(TransactionType.SALE);
//         saleTransaction.setVariantId(event.getVariantId());
//         saleTransaction.setQuantity(event.getQuantity());
//         saleTransaction.setToDealerId(event.getDealerId()); // `toDealerId` trong ngữ cảnh SALE có nghĩa là đại lý đã bán
//         saleTransaction.setReferenceId("ORDER-" + event.getOrderId());
//         saleTransaction.setStaffId("SYSTEM_AUTO"); // Đánh dấu là giao dịch tự động
//         saleTransaction.setNotes("Auto-deducted stock due to confirmed order.");

//         // 2. Gọi service để thực hiện việc trừ kho
//         try {
//             inventoryService.executeTransaction(saleTransaction);
//         } catch (Exception e) {
//             // Xử lý lỗi: Ghi log, gửi vào một "dead-letter queue" để xử lý lại sau
//             System.err.println("!!! Failed to process stock deduction for order: " + event.getOrderId() + ". Error: " + e.getMessage());
//         }
//     }
// }
