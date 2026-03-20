package com.ev.inventory_service.model.Enum;

public enum TransferRequestStatus {
    PENDING,//  Yêu cầu vừa được tạo, đang chờ quản lý kho trung tâm (EVM Staff) xem xét và duyệt.
    CONFIRMED,//  Yêu cầu đã được duyệt.
    IN_TRANSIT,// Đã xuất kho. Các xe (theo số VIN) đang trên đường vận chuyển đến đại lý.
    DELIVERED,//  Đại lý đã xác nhận nhận được hàng. Giao dịch hoàn tất.
    CANCELLED //  Yêu cầu đã bị hủy (bởi EVM Staff hoặc Đại lý).
}