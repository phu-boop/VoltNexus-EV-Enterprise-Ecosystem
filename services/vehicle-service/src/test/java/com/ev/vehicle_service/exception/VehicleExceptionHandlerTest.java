package com.ev.vehicle_service.exception;

import com.ev.common_lib.dto.respond.ApiRespond;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
class VehicleExceptionHandlerTest {

    @InjectMocks
    private VehicleExceptionHandler exceptionHandler;

    @Test
    void testHandleDataIntegrityViolationException_DuplicateEntry() {
        Throwable cause = new Throwable("Duplicate entry 'SKU123' for key 'vehicle_variants");
        DataIntegrityViolationException ex = new DataIntegrityViolationException("Outer msg", cause);

        ResponseEntity<ApiRespond<?>> response = exceptionHandler.handleDataIntegrityViolationException(ex);

        assertEquals(400, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("Mã SKU thư viện đã tồn tại. Vui lòng nhập mã SKU khác.", response.getBody().getMessage());
    }

    @Test
    void testHandleDataIntegrityViolationException_ThumbnailTooLong() {
        Throwable cause = new Throwable("Data too long for column 'thumbnail_url'");
        DataIntegrityViolationException ex = new DataIntegrityViolationException("Outer msg", cause);

        ResponseEntity<ApiRespond<?>> response = exceptionHandler.handleDataIntegrityViolationException(ex);

        assertEquals(400, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("Link ảnh đại diện quá dài. Vui lòng sử dụng đường đẫn ngắn hơn.", response.getBody().getMessage());
    }

    @Test
    void testHandleDataIntegrityViolationException_ImageTooLong() {
        Throwable cause = new Throwable("Data too long for column 'image_url'");
        DataIntegrityViolationException ex = new DataIntegrityViolationException("Outer msg", cause);

        ResponseEntity<ApiRespond<?>> response = exceptionHandler.handleDataIntegrityViolationException(ex);

        assertEquals(400, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("Link ảnh phiên bản quá dài. Vui lòng sử dụng đường đẫn ngắn hơn.", response.getBody().getMessage());
    }

    @Test
    void testHandleDataIntegrityViolationException_OtherError() {
        Throwable cause = new Throwable("unknown error");
        DataIntegrityViolationException ex = new DataIntegrityViolationException("Outer msg", cause);

        ResponseEntity<ApiRespond<?>> response = exceptionHandler.handleDataIntegrityViolationException(ex);

        assertEquals(400, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("Lỗi dữ liệu hệ thống: unknown error", response.getBody().getMessage());
    }
}
