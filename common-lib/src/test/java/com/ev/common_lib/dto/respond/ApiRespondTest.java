package com.ev.common_lib.dto.respond;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApiRespondTest {

    @Test
    void apiRespond_GetterSetter() {
        ApiRespond<String> respond = new ApiRespond<>();
        respond.setCode("1000");
        respond.setMessage("Success");
        respond.setData("Data");

        assertEquals("1000", respond.getCode());
        assertEquals("Success", respond.getMessage());
        assertEquals("Data", respond.getData());
    }

    @Test
    void apiRespond_AllArgsConstructor() {
        ApiRespond<String> respond = new ApiRespond<>("2001", "Error", "More Info");
        assertEquals("2001", respond.getCode());
        assertEquals("Error", respond.getMessage());
        assertEquals("More Info", respond.getData());
    }
}
