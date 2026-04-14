package com.ev.common_lib.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.*;

class ErrorCodeTest {

    @Test
    void errorCode_ShouldHaveCorrectValues() {
        ErrorCode errorCode = ErrorCode.SUCCESS;
        assertEquals("1000", errorCode.getCode());
        assertEquals("Thành công", errorCode.getMessage());
        assertEquals(HttpStatus.OK, errorCode.getHttpStatus());
    }

    @Test
    void errorCode_AllValuesShouldBeConsistent() {
        for (ErrorCode code : ErrorCode.values()) {
            assertNotNull(code.getCode());
            assertNotNull(code.getMessage());
            assertNotNull(code.getHttpStatus());
        }
    }
}
