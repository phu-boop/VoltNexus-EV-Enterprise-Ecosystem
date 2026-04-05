package com.ev.customer_service.exception;

import com.ev.customer_service.dto.response.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SuppressWarnings("null")
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("Handle ResourceNotFoundException")
    void handleResourceNotFoundException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Not found");
        ResponseEntity<ApiResponse<Object>> response = handler.handleResourceNotFoundException(ex);

        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Not found", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Handle DuplicateResourceException")
    void handleDuplicateResourceException() {
        DuplicateResourceException ex = new DuplicateResourceException("Duplicate");
        ResponseEntity<ApiResponse<Object>> response = handler.handleDuplicateResourceException(ex);

        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Duplicate", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Handle IllegalArgumentException")
    void handleIllegalArgumentException() {
        IllegalArgumentException ex = new IllegalArgumentException("Invalid arg");
        ResponseEntity<ApiResponse<Object>> response = handler.handleIllegalArgumentException(ex);

        assertNotNull(response.getBody());
        assertEquals("Invalid arg", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Handle IllegalStateException")
    void handleIllegalStateException() {
        IllegalStateException ex = new IllegalStateException("Invalid state");
        ResponseEntity<ApiResponse<Object>> response = handler.handleIllegalStateException(ex);

        assertNotNull(response.getBody());
        assertEquals("Invalid state", response.getBody().getMessage());
    }

    @Test
    @DisplayName("Handle MethodArgumentNotValidException")
    void handleMethodArgumentNotValidException() throws NoSuchMethodException {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "object");
        bindingResult.addError(new FieldError("object", "field", "rejected", false, null, null, "default message"));

        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(
                new MethodParameter(this.getClass().getDeclaredMethod("setUp"), -1),
                bindingResult);

        ResponseEntity<ApiResponse<Map<String, String>>> response = handler.handleValidationExceptions(ex);

        assertNotNull(response.getBody());
        assertEquals("Validation failed", response.getBody().getMessage());
        assertNotNull(response.getBody().getData());
        assertTrue(response.getBody().getData().containsKey("field"));
        assertEquals("default message", response.getBody().getData().get("field"));
    }

    @Test
    @DisplayName("Handle RuntimeException - General")
    void handleRuntimeExceptionGeneral() {
        RuntimeException ex = new RuntimeException("Runtime error");
        ResponseEntity<ApiResponse<Object>> response = handler.handleRuntimeException(ex);

        assertNotNull(response.getBody());
        assertTrue(response.getBody().getMessage().contains("Runtime error"));
    }

    @Test
    @DisplayName("Handle RuntimeException - User Service Connection")
    void handleRuntimeExceptionUserService() {
        RuntimeException ex = new RuntimeException("Unable to fetch staff information: timeout");
        ResponseEntity<ApiResponse<Object>> response = handler.handleRuntimeException(ex);

        assertNotNull(response.getBody());
        assertTrue(response.getBody().getMessage().contains("Cannot connect to User Service"));
    }

    @Test
    @DisplayName("Handle Exception - Unexpected")
    void handleException() {
        Exception ex = new Exception("Unexpected error");
        ResponseEntity<ApiResponse<Object>> response = handler.handleGlobalException(ex);

        assertNotNull(response.getBody());
        assertTrue(response.getBody().getMessage().contains("Unexpected error"));
    }
}
