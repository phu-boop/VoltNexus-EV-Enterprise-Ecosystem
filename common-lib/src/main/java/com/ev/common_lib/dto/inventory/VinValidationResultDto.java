package com.ev.common_lib.dto.inventory;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class VinValidationResultDto {
    // Key: VIN, Value: Thông báo lỗi
    private Map<String, String> invalidVins; 
    
    // Danh sách các VIN hợp lệ (để tham khảo)
    private List<String> validVins;
}
