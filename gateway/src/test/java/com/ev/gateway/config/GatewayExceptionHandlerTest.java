package com.ev.gateway.config;

import com.ev.common_lib.exception.ErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.core.io.buffer.DefaultDataBufferFactory;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.net.ConnectException;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GatewayExceptionHandlerTest {

    @InjectMocks
    private GatewayExceptionHandler exceptionHandler;

    private ServerWebExchange exchange;
    private DataBufferFactory bufferFactory;

    @BeforeEach
    void setUp() {
        exchange = MockServerWebExchange.from(MockServerHttpRequest.get("/test").build());
        bufferFactory = new DefaultDataBufferFactory();
    }

    @Test
    void handle_ResponseStatusException_NotFound() {
        ResponseStatusException ex = new ResponseStatusException(HttpStatus.NOT_FOUND, "Not Found");

        Mono<Void> result = exceptionHandler.handle(exchange, ex);

        StepVerifier.create(result)
                .verifyComplete();

        assertEquals(HttpStatus.NOT_FOUND, exchange.getResponse().getStatusCode());
        assertEquals("application/json", exchange.getResponse().getHeaders().getContentType().toString());
    }

    @Test
    void handle_ConnectException() {
        ConnectException ex = new ConnectException("Connection refused");

        Mono<Void> result = exceptionHandler.handle(exchange, ex);

        StepVerifier.create(result)
                .verifyComplete();

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exchange.getResponse().getStatusCode());
    }

    @Test
    void handle_TimeoutException() {
        TimeoutException ex = new TimeoutException("Read timeout");

        Mono<Void> result = exceptionHandler.handle(exchange, ex);

        StepVerifier.create(result)
                .verifyComplete();

        assertEquals(HttpStatus.REQUEST_TIMEOUT, exchange.getResponse().getStatusCode());
    }

    @Test
    void handle_GenericException() {
        RuntimeException ex = new RuntimeException("Unexpected error");

        Mono<Void> result = exceptionHandler.handle(exchange, ex);

        StepVerifier.create(result)
                .verifyComplete();

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exchange.getResponse().getStatusCode());
    }
}
