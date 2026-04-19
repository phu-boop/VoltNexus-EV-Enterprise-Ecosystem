package com.ev.customer_service.util;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LenientLongDeserializerTest {

    private final LenientLongDeserializer deserializer = new LenientLongDeserializer();

    @Mock
    private JsonParser jsonParser;

    @Mock
    private DeserializationContext context;

    @Test
    @DisplayName("Parse numeric token")
    void deserialize_numeric() throws IOException {
        when(jsonParser.getCurrentToken()).thenReturn(JsonToken.VALUE_NUMBER_INT);
        when(jsonParser.getLongValue()).thenReturn(12345L);

        Long result = deserializer.deserialize(jsonParser, context);

        assertThat(result).isEqualTo(12345L);
    }

    @Test
    @DisplayName("Parse valid number string")
    void deserialize_string_valid() throws IOException {
        when(jsonParser.getCurrentToken()).thenReturn(JsonToken.VALUE_STRING);
        when(jsonParser.getText()).thenReturn("67890");

        Long result = deserializer.deserialize(jsonParser, context);

        assertThat(result).isEqualTo(67890L);
    }

    @Test
    @DisplayName("Parse mixed string (extract digits)")
    void deserialize_string_mixed() throws IOException {
        when(jsonParser.getCurrentToken()).thenReturn(JsonToken.VALUE_STRING);
        when(jsonParser.getText()).thenReturn("id:13579");

        Long result = deserializer.deserialize(jsonParser, context);

        assertThat(result).isEqualTo(13579L);
    }

    @Test
    @DisplayName("Parse empty string → null")
    void deserialize_string_empty() throws IOException {
        when(jsonParser.getCurrentToken()).thenReturn(JsonToken.VALUE_STRING);
        when(jsonParser.getText()).thenReturn("");

        Long result = deserializer.deserialize(jsonParser, context);

        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Parse invalid alphanumeric string without digits → null")
    void deserialize_string_invalid() throws IOException {
        when(jsonParser.getCurrentToken()).thenReturn(JsonToken.VALUE_STRING);
        when(jsonParser.getText()).thenReturn("abcde");

        Long result = deserializer.deserialize(jsonParser, context);

        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Token null → null")
    void deserialize_tokenNull() throws IOException {
        when(jsonParser.getCurrentToken()).thenReturn(null);

        Long result = deserializer.deserialize(jsonParser, context);

        assertThat(result).isNull();
    }
}
