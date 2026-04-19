package com.ev.inventory_service.model;

import com.ev.inventory_service.model.Enum.VehiclePhysicalStatus; // Bạn sẽ cần tạo Enum này
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "physical_vehicles")
@Data
public class PhysicalVehicle {

    @Id
    @Column(length = 17, unique = true, nullable = false)
    private String vin; // Số VIN (Vehicle Identification Number) - 17 ký tự

    @Column(nullable = false)
    private Long variantId; // Khóa ngoại, trỏ đến `vehicle-service`

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehiclePhysicalStatus status; // Trạng thái của chiếc xe này

    // Vị trí hiện tại của xe.
    // Nếu là KHO TRUNG TÂM, locationId là null.
    // Nếu là ĐẠI LÝ, locationId là UUID của đại lý đó.
    private UUID locationId; 
    private UUID orderId;

    private LocalDate manufactureDate; // Ngày sản xuất
    private String notes; // Ghi chú (ví dụ: "Trầy xước nhẹ cản sau")
}
