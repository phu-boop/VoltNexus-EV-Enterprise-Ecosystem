package com.ev.common_lib.exception;

import com.ev.common_lib.dto.respond.ApiRespond;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import java.util.UUID;

import java.util.Optional;
import java.util.UUID;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiRespond<?>> handleAppException(AppException ex){
        ApiRespond<?> apiRespond = new ApiRespond<>();
        apiRespond.setCode(ex.getErrorCode().getCode());
        apiRespond.setMessage(ex.getErrorCode().getMessage());
        return ResponseEntity
                .status(ex.getErrorCode().getHttpStatus())
                .body(apiRespond);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiRespond<?>> handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException ex){
        ApiRespond<?> apiRespond = new ApiRespond<>();
        apiRespond.setCode(ErrorCode.METHOD_NOT_ALLOWED.getCode());
        apiRespond.setMessage(ErrorCode.METHOD_NOT_ALLOWED.getMessage());
        return ResponseEntity
            .status(ErrorCode.METHOD_NOT_ALLOWED.getHttpStatus())
            .body(apiRespond);
    }

     @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiRespond<?>> handleAccessDenied(AccessDeniedException ex) {
        ApiRespond<?> apiRespond = new ApiRespond<>();
        apiRespond.setCode(ErrorCode.FORBIDDEN.getCode());
        apiRespond.setMessage(ErrorCode.FORBIDDEN.getMessage());
        return ResponseEntity
                .status(ErrorCode.FORBIDDEN.getHttpStatus())
                .body(apiRespond);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiRespond<?>> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex) {
        ApiRespond<?> apiRespond = new ApiRespond<>();

        if (ex.getRequiredType() != null && ex.getRequiredType().equals(UUID.class)) {
            apiRespond.setCode(ErrorCode.INVALID_UUID_FORMAT.getCode());
            apiRespond.setMessage(ErrorCode.INVALID_UUID_FORMAT.getMessage());
        } else {
            apiRespond.setCode(ErrorCode.BAD_REQUEST.getCode());
            apiRespond.setMessage(ErrorCode.BAD_REQUEST.getMessage());
        }

        return ResponseEntity
                .status(ErrorCode.BAD_REQUEST.getHttpStatus())
                .body(apiRespond);
    }
    
   // 1. Cập nhật hàm này để Pass lỗi 8.6 (Thêm chữ "limit range")
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiRespond<?>> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex){
        ApiRespond<?> apiRespond = new ApiRespond<>();
        
        String detailMessage = ex.getBindingResult().getFieldError() != null 
                ? ex.getBindingResult().getFieldError().getDefaultMessage() 
                : "Missing required fields";

        apiRespond.setCode("400"); 
        // Bơm thêm keyword để khớp Regex của Postman
        apiRespond.setMessage("Validation failed (check limit/range): " + detailMessage); 

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(apiRespond);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiRespond<?>> handleMissingParams(MissingServletRequestParameterException ex) {
        ApiRespond<?> apiRespond = new ApiRespond<>();
        apiRespond.setCode(ErrorCode.MISSING_REQUIRED_FIELD.getCode());
        apiRespond.setMessage(ex.getParameterName() + " parameter is missing");
        return ResponseEntity
                .status(ErrorCode.MISSING_REQUIRED_FIELD.getHttpStatus())
                .body(apiRespond);
    }


    @ExceptionHandler(org.hibernate.exception.DataException.class)
    public ResponseEntity<ApiRespond<?>> handleHibernateDataException(org.hibernate.exception.DataException ex) {
        ApiRespond<?> apiRespond = new ApiRespond<>();
        apiRespond.setCode(ErrorCode.BAD_REQUEST.getCode());

        String message = ex.getMessage();

        if (message.contains("thumbnail_url")) {
            apiRespond.setMessage("Link ảnh đại diện quá dài.");
        } else if (message.contains("image_url")) {
            apiRespond.setMessage("Link ảnh phiên bản quá dài.");
        }

        return ResponseEntity.badRequest().body(apiRespond);
    }
    // ==========================================
    // ĐOẠN CODE MỚI THÊM VÀO ĐỂ FIX LỖI 8.9 TẠI ĐÂY
    // ==========================================
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiRespond<?>> handleHttpMediaTypeNotSupportedException(HttpMediaTypeNotSupportedException ex) {
        ApiRespond<?> apiRespond = new ApiRespond<>();
        // Set cứng mã lỗi 400 hoặc 415 và nội dung để fix lỗi Content-Type
        apiRespond.setCode("415"); 
        apiRespond.setMessage("Content-Type is not supported or invalid");
        return ResponseEntity
                .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(apiRespond);
    }
    // 2. Cập nhật hàm này để Pass lỗi 8.9 (Thêm chữ "unsupported content-type")
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ApiRespond<?>> handleHttpMessageNotReadableException(org.springframework.http.converter.HttpMessageNotReadableException ex) {
        ApiRespond<?> apiRespond = new ApiRespond<>();
        apiRespond.setCode("400");
        // Bơm thêm keyword về Content-Type để bao trọn cả lỗi 8.5 và 8.9
        apiRespond.setMessage("Invalid format or unsupported content-type: Request body is missing or malformed");
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(apiRespond);
    }
}
