package com.ev.common_lib.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AppExceptionTest {

    @Test
    void appException_ConstructorAndGetterSetter() {
        ErrorCode errorCode = ErrorCode.USER_NOT_FOUND;
        AppException ex = new AppException(errorCode);
        
        assertEquals(errorCode, ex.getErrorCode());
        assertEquals(errorCode.getMessage(), ex.getMessage());
        
        ErrorCode newErrorCode = ErrorCode.INTERNAL_ERROR;
        ex.setErrorCode(newErrorCode);
        assertEquals(newErrorCode, ex.getErrorCode());
    }

    @Test
    void appException_NoArgsConstructor() {
        AppException ex = new AppException();
        assertNull(ex.getErrorCode());
    }
}
