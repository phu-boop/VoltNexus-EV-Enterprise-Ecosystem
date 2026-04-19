package com.ev.customer_service.util;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Jackson deserializer that is lenient when parsing Long values.
 *
 * If the incoming JSON token is numeric, it will be parsed normally.
 * If it is a String, this deserializer will try to parse the entire string as a
 * long,
 * then try to extract the first integer-looking substring (e.g. "123" inside
 * "id:123"),
 * and finally return null if nothing parseable is found.
 *
 * Returning null allows the request validation (@NotNull) to reject invalid
 * values with a clear 400
 * instead of producing a HttpMessageNotReadableException.
 */
public class LenientLongDeserializer extends JsonDeserializer<Long> {

    private static final Pattern DIGIT_PATTERN = Pattern.compile("(-?\\d+)");

    @Override
    public Long deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonToken token = p.getCurrentToken();

        if (token == null) {
            return null;
        }

        if (token.isNumeric()) {
            return parseNumeric(p);
        }

        if (token == JsonToken.VALUE_STRING) {
            return parseTextualValue(p.getText());
        }

        return null;
    }

    private Long parseNumeric(JsonParser p) {
        try {
            return p.getLongValue();
        } catch (IOException e) {
            return null;
        }
    }

    private Long parseTextualValue(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }

        String cleanedText = text.trim();

        // 1. Try parsing the whole string directly
        try {
            return Long.parseLong(cleanedText);
        } catch (NumberFormatException ignored) {
            // Not a simple number string, try extraction
        }

        // 2. Extract first integer-like substring (e.g., "id:123" -> 123)
        Matcher m = DIGIT_PATTERN.matcher(cleanedText);
        if (m.find()) {
            try {
                return Long.parseLong(m.group(1));
            } catch (NumberFormatException ignored) {
                // Too large for Long or otherwise unparseable
            }
        }

        return null;
    }
}
