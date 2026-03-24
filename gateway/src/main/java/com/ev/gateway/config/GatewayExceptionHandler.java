package com.ev.gateway.config;

import com.ev.common_lib.exception.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

@Component
@Order(-2)
public class GatewayExceptionHandler implements ErrorWebExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GatewayExceptionHandler.class);

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        var response = exchange.getResponse();

        if (response.isCommitted()) {
            log.error("[GatewayExceptionHandler] Response already committed. Path: {}, Method: {}",
                    exchange.getRequest().getURI(), exchange.getRequest().getMethod(), ex);
            return Mono.error(ex);
        }

        // Log detailed error information
        log.error("[GatewayExceptionHandler] Error on path: {} | Method: {} | Exception: {} | Message: {}",
                exchange.getRequest().getURI().getPath(),
                exchange.getRequest().getMethod(),
                ex.getClass().getSimpleName(),
                ex.getMessage());

        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        // Map exception to ErrorCode
        ErrorCode errorCode = mapExceptionToErrorCode(ex);
        String message = (ex.getMessage() != null) ? ex.getMessage() : errorCode.getMessage();

        HttpStatus status = errorCode.getHttpStatus();
        response.setStatusCode(status);

        log.info("[GatewayExceptionHandler] Returning error code={} message={} httpStatus={}",
                errorCode.getCode(), message, status);

        // Standardized ApiRespond format
        String json = String.format(
                "{\"timestamp\":\"%s\",\"code\":\"%s\",\"message\":\"%s\",\"data\":null}",
                Instant.now(),
                errorCode.getCode(),
                message.replace("\"", "\\\"")); // Basic escaping for safety

        DataBufferFactory bufferFactory = response.bufferFactory();
        return response.writeWith(Mono.just(bufferFactory.wrap(json.getBytes(StandardCharsets.UTF_8))));
    }

    private ErrorCode mapExceptionToErrorCode(Throwable ex) {
        String message = ex.getMessage() != null ? ex.getMessage().toLowerCase() : "";

        if (ex instanceof org.springframework.web.server.ResponseStatusException rse) {
            if (rse.getStatusCode() == HttpStatus.NOT_FOUND)
                return ErrorCode.DATA_NOT_FOUND;
            if (rse.getStatusCode() == HttpStatus.BAD_REQUEST)
                return ErrorCode.BAD_REQUEST;
            if (rse.getStatusCode() == HttpStatus.UNAUTHORIZED)
                return ErrorCode.UNAUTHORIZED;
            if (rse.getStatusCode() == HttpStatus.FORBIDDEN)
                return ErrorCode.FORBIDDEN;
        }

        if (ex instanceof java.net.ConnectException || message.contains("connection refused")) {
            return ErrorCode.SERVICE_UNAVAILABLE;
        }

        if (ex instanceof java.util.concurrent.TimeoutException || message.contains("timeout")) {
            return ErrorCode.TIMEOUT;
        }

        return ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE;
    }
}
