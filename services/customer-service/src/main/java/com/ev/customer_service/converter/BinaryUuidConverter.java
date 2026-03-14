package com.ev.customer_service.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Converter for handling BINARY(16) UUID columns in MySQL.
 * Converts between binary UUID bytes in database and hex String in Java.
 */
@Converter(autoApply = false)
public class BinaryUuidConverter implements AttributeConverter<String, byte[]> {

    @Override
    public byte[] convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }
        
        // Remove hyphens if UUID format (e.g., "3ec76f92-7d44-49f4-ada1-b47d4f55b418")
        String hex = attribute.replace("-", "");
        
        // Convert hex string to byte array
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                                + Character.digit(hex.charAt(i+1), 16));
        }
        return data;
    }

    @Override
    public String convertToEntityAttribute(byte[] dbData) {
        if (dbData == null || dbData.length == 0) {
            return null;
        }
        
        // Convert byte array to hex string
        StringBuilder sb = new StringBuilder();
        for (byte b : dbData) {
            sb.append(String.format("%02x", b));
        }
        
        // Return as hex string (32 characters)
        // Can optionally format as UUID: "3ec76f92-7d44-49f4-ada1-b47d4f55b418"
        String hex = sb.toString();
        if (hex.length() == 32) {
            // Format as UUID for readability
            return hex.substring(0, 8) + "-" + 
                   hex.substring(8, 12) + "-" + 
                   hex.substring(12, 16) + "-" + 
                   hex.substring(16, 20) + "-" + 
                   hex.substring(20, 32);
        }
        return hex;
    }
}
