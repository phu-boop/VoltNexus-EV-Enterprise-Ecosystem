package com.ev.customer_service.converter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class BinaryUuidConverterTest {

    private BinaryUuidConverter converter;

    @BeforeEach
    void setUp() {
        converter = new BinaryUuidConverter();
    }

    @Test
    @DisplayName("Convert to Database Column - Null or Empty")
    void convertToDatabaseColumnNullOrEmpty() {
        assertNull(converter.convertToDatabaseColumn(null));
        assertNull(converter.convertToDatabaseColumn(""));
    }

    @Test
    @DisplayName("Convert to Database Column - Valid UUID")
    void convertToDatabaseColumnValid() {
        String uuid = "3ec76f92-7d44-49f4-ada1-b47d4f55b418";
        byte[] result = converter.convertToDatabaseColumn(uuid);

        assertNotNull(result);
        assertEquals(16, result.length);
        // First byte: 3e -> 0x3e (62)
        assertEquals((byte) 0x3e, result[0]);
    }

    @Test
    @DisplayName("Convert to Entity Attribute - Null or Empty")
    void convertToEntityAttributeNullOrEmpty() {
        assertNull(converter.convertToEntityAttribute(null));
        assertNull(converter.convertToEntityAttribute(new byte[0]));
    }

    @Test
    @DisplayName("Convert to Entity Attribute - Valid Bytes")
    void convertToEntityAttributeValid() {
        byte[] data = new byte[16];
        data[0] = (byte) 0x3e;
        data[1] = (byte) 0xc7;
        data[2] = (byte) 0x6f;
        data[3] = (byte) 0x92;
        data[4] = (byte) 0x7d;
        data[5] = (byte) 0x44;
        data[6] = (byte) 0x49;
        data[7] = (byte) 0xf4;
        data[8] = (byte) 0xad;
        data[9] = (byte) 0xa1;
        data[10] = (byte) 0xb4;
        data[11] = (byte) 0x7d;
        data[12] = (byte) 0x4f;
        data[13] = (byte) 0x55;
        data[14] = (byte) 0xb4;
        data[15] = (byte) 0x18;

        String result = converter.convertToEntityAttribute(data);

        assertEquals("3ec76f92-7d44-49f4-ada1-b47d4f55b418", result);
    }

    @Test
    @DisplayName("Convert to Entity Attribute - Short Bytes")
    void convertToEntityAttributeShort() {
        byte[] data = new byte[2];
        data[0] = (byte) 0xab;
        data[1] = (byte) 0xcd;

        String result = converter.convertToEntityAttribute(data);
        assertEquals("abcd", result);
    }
}
