package com.ev.customer_service.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

import java.util.UUID;

@Converter(autoApply = false)
@Slf4j
public class UuidStringConverter implements AttributeConverter<UUID, String> {

    @Override
    public String convertToDatabaseColumn(UUID attribute) {
        return attribute == null ? null : attribute.toString();
    }

    @Override
    public UUID convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        try {
            // Check if string is missing hyphens (32 chars)
            if (dbData.length() == 32 && !dbData.contains("-")) {
                String withHyphens = dbData.substring(0, 8) + "-" +
                        dbData.substring(8, 12) + "-" +
                        dbData.substring(12, 16) + "-" +
                        dbData.substring(16, 20) + "-" +
                        dbData.substring(20);
                return UUID.fromString(withHyphens);
            }
            return UUID.fromString(dbData);
        } catch (IllegalArgumentException e) {
            log.error("Failed to convert string '{}' to UUID. Returning null instead to prevent application crash.", dbData, e);
            return null; // Return null instead of crashing the app
        }
    }
}
