package com.ev.customer_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO để Staff cập nhật tiến độ xử lý
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintProgressUpdate {

    private String updateNote; // Nội dung cập nhật
    private String updatedByStaffId; // Người cập nhật
    private String updatedByStaffName;
    // Future: có thể thêm attachmentUrls (file đính kèm)
}
