package com.ev.vehicle_service.exception;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.exception.ErrorCode;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class VehicleExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiRespond<?>> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        ApiRespond<?> apiRespond = new ApiRespond<>();
        apiRespond.setCode(ErrorCode.BAD_REQUEST.getCode());

        String detailMessage = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage()
                : ex.getMessage();

        if (detailMessage != null && detailMessage.contains("Duplicate entry")
                && detailMessage.contains("for key 'vehicle_variants")) {
            apiRespond.setMessage("Mã SKU thư viện đã tồn tại. Vui lòng nhập mã SKU khác.");
        } else if (detailMessage != null && detailMessage.contains("Data too long for column 'thumbnail_url'")) {
            apiRespond.setMessage("Link ảnh đại diện quá dài. Vui lòng sử dụng đường đẫn ngắn hơn.");
        } else if (detailMessage != null && detailMessage.contains("Data too long for column 'image_url'")) {
            apiRespond.setMessage("Link ảnh phiên bản quá dài. Vui lòng sử dụng đường đẫn ngắn hơn.");
        } else {
            apiRespond.setMessage("Lỗi dữ liệu hệ thống: " + detailMessage);
        }

        return ResponseEntity.status(400).body(apiRespond);
    }
}
