package com.ev.common_lib.exception;

import com.ev.common_lib.dto.respond.ApiRespond;
import org.hibernate.exception.DataException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.sql.SQLException;
import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler globalExceptionHandler;
    private MockMvc mockMvc;

    @RestController
    static class TestController {
        @GetMapping("/app-exception")
        public void triggerAppException() {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        @PostMapping("/method-not-supported")
        public void triggerMethodNotSupported() {}

        @GetMapping("/access-denied")
        public void triggerAccessDenied() {
            throw new AccessDeniedException("Access Denied");
        }

        @GetMapping("/type-mismatch")
        public void triggerTypeMismatch(@RequestParam UUID id) {}

        @GetMapping("/missing-param")
        public void triggerMissingParam(@RequestParam String name) {}
    }

    @BeforeEach
    void setUp() {
        globalExceptionHandler = new GlobalExceptionHandler();
        mockMvc = MockMvcBuilders.standaloneSetup(new TestController())
                .setControllerAdvice(globalExceptionHandler)
                .build();
    }

    @Test
    void handleAppException_ShouldReturnCorrectResponse() throws Exception {
        mockMvc.perform(get("/app-exception"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("5001"))
                .andExpect(jsonPath("$.message").value("Không tìm thấy người dùng"));
    }

    @Test
    void handleHttpRequestMethodNotSupportedException_ShouldReturnMethodNotAllowed() throws Exception {
        mockMvc.perform(post("/app-exception"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.code").value("2003"));
    }

    @Test
    void handleAccessDenied_ShouldReturnForbidden() throws Exception {
        mockMvc.perform(get("/access-denied"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("4002"));
    }

    @Test
    void handleMethodArgumentTypeMismatch_WithUUID_ShouldReturnInvalidUUID() throws Exception {
        mockMvc.perform(get("/type-mismatch").param("id", "not-a-uuid"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("2028"));
    }

    @Test
    void handleMissingParams_ShouldReturnMissingField() throws Exception {
        mockMvc.perform(get("/missing-param"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("2005"));
    }

    @Test
    void handleMethodArgumentNotValidException_ShouldReturnValidationFailed() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("object", "field", "must not be null");
        
        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(Collections.singletonList(fieldError));

        ResponseEntity<ApiRespond<?>> response = globalExceptionHandler.handleMethodArgumentNotValidException(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getMessage().contains("Validation failed"));
        assertTrue(response.getBody().getMessage().contains("field=must not be null"));
    }

    @Test
    void handleHibernateDataException_ThumbnailUrl_ShouldReturnCustomMessage() {
        DataException ex = new DataException("Error", new SQLException(), "thumbnail_url error");
        ResponseEntity<ApiRespond<?>> response = globalExceptionHandler.handleHibernateDataException(ex);
        assertNotNull(response.getBody());
        assertEquals("Link ảnh đại diện quá dài.", response.getBody().getMessage());
    }

    @Test
    void handleHibernateDataException_ImageUrl_ShouldReturnCustomMessage() {
        DataException ex = new DataException("Error", new SQLException(), "image_url error");
        ResponseEntity<ApiRespond<?>> response = globalExceptionHandler.handleHibernateDataException(ex);
        assertNotNull(response.getBody());
        assertEquals("Link ảnh phiên bản quá dài.", response.getBody().getMessage());
    }

    @Test
    void handleHttpMediaTypeNotSupportedException_ShouldReturn415() {
        HttpMediaTypeNotSupportedException ex = new HttpMediaTypeNotSupportedException("Unsupported");
        ResponseEntity<ApiRespond<?>> response = globalExceptionHandler.handleHttpMediaTypeNotSupportedException(ex);
        assertEquals(HttpStatus.UNSUPPORTED_MEDIA_TYPE, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("415", response.getBody().getCode());
    }

    @Test
    @SuppressWarnings("deprecation")
    void handleHttpMessageNotReadableException_ShouldReturn400() {
        HttpMessageNotReadableException ex = new HttpMessageNotReadableException("Malformed body");
        ResponseEntity<ApiRespond<?>> response = globalExceptionHandler.handleHttpMessageNotReadableException(ex);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getMessage().contains("unsupported content-type"));
    }
}
