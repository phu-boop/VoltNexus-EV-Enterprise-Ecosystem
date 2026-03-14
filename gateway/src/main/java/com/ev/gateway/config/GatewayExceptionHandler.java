package com.ev.gateway.config;

import com.ev.common_lib.dto.respond.ApiRespond;
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

        // Nếu response đã commit thì không thể gửi lỗi
        if (response.isCommitted()) {
            log.error("[GatewayExceptionHandler] Response already committed. Path: {}, Method: {}",
                    exchange.getRequest().getURI(), exchange.getRequest().getMethod(), ex);
            return Mono.error(ex);
        }

        // Log toàn bộ thông tin request và exception
        log.error("[GatewayExceptionHandler] Handling exception for request");
        log.error("  Path: {}", exchange.getRequest().getURI().getPath());
        log.error("  Method: {}", exchange.getRequest().getMethod());
        log.error("  Headers: {}", exchange.getRequest().getHeaders());
        log.error("  Query params: {}", exchange.getRequest().getQueryParams());
        log.error("  Remote address: {}", exchange.getRequest().getRemoteAddress());
        log.error("  Exception type: {}", ex.getClass().getName());
        log.error("  Exception message: {}", ex.getMessage(), ex);

        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        // Mặc định là lỗi downstream
        ErrorCode errorCode = ErrorCode.DOWNSTREAM_SERVICE_UNAVAILABLE;
        String message = ex.getMessage();

        // Phân loại lỗi cụ thể
        if (message != null && message.contains("Connection refused")) {
            errorCode = ErrorCode.SERVICE_UNAVAILABLE;
        } else if (message != null && message.contains("timeout")) {
            errorCode = ErrorCode.TIMEOUT;
        }

        HttpStatus status = errorCode.getHttpStatus();
        response.setStatusCode(status);

        // Log chi tiết status trả về
        log.info("[GatewayExceptionHandler] Returning error code={} message={} httpStatus={}",
                errorCode.getCode(), errorCode.getMessage(), status);

        ApiRespond<Object> apiRespond = new ApiRespond<>();
        apiRespond.setCode(errorCode.getCode());
        apiRespond.setMessage(errorCode.getMessage());
        apiRespond.setData(null);

        String json = String.format(
                "{\"timestamp\":\"%s\",\"code\":\"%s\",\"message\":\"%s\",\"data\":null}",
                Instant.now(),
                apiRespond.getCode(),
                apiRespond.getMessage()
        );

        DataBufferFactory bufferFactory = response.bufferFactory();
        return response.writeWith(Mono.just(bufferFactory.wrap(json.getBytes(StandardCharsets.UTF_8))));
    }
}
