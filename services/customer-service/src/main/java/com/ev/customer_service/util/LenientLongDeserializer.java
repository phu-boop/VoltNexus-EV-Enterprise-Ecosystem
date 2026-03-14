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
 * If it is a String, this deserializer will try to parse the entire string as a long,
 * then try to extract the first integer-looking substring (e.g. "123" inside "id:123"),
 * and finally return null if nothing parseable is found.
 *
 * Returning null allows the request validation (@NotNull) to reject invalid values with a clear 400
 * instead of producing a HttpMessageNotReadableException.
 */
public class LenientLongDeserializer extends JsonDeserializer<Long> {

    private static final Pattern DIGIT_PATTERN = Pattern.compile("(-?\\d+)");

    @Override
    public Long deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonToken token = p.getCurrentToken();

        if (token == JsonToken.VALUE_NUMBER_INT || token == JsonToken.VALUE_NUMBER_FLOAT) {
            try {
                return p.getLongValue();
            } catch (Exception e) {
                return null;
            }
        }

        if (token == JsonToken.VALUE_STRING) {
            String text = p.getText();
            if (text == null) return null;
            text = text.trim();
            if (text.isEmpty()) return null;

            // Try parse whole string
            try {
                return Long.parseLong(text);
            } catch (NumberFormatException ignored) {
            }

            // Extract first integer-like substring
            Matcher m = DIGIT_PATTERN.matcher(text);
            if (m.find()) {
                try {
                    return Long.parseLong(m.group(1));
                } catch (NumberFormatException ignored) {
                }
            }

            // Unparseable -> return null so validation can handle it
            return null;
        }

        // For other token types, return null
        return null;
    }
}
