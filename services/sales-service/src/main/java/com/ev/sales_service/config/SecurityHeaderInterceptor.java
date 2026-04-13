package com.ev.sales_service.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.io.IOException;

@Component
@Slf4j
public class SecurityHeaderInterceptor implements RequestInterceptor, ClientHttpRequestInterceptor {

    private static final String HEADER_EMAIL = "X-User-Email";
    private static final String HEADER_ROLE = "X-User-Role";
    private static final String HEADER_PROFILE_ID = "X-User-ProfileId";
    private static final String HEADER_DEALER_ID = "X-User-DealerId";

    private static final String SYSTEM_EMAIL = "system@vms.com";
    private static final String SYSTEM_ROLE = "SYSTEM";

    /**
     * For Feign Client
     */
    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            propagateHeader(request, template, HEADER_EMAIL);
            propagateHeader(request, template, HEADER_ROLE);
            propagateHeader(request, template, HEADER_PROFILE_ID);
            propagateHeader(request, template, HEADER_DEALER_ID);
        } else {
            // Apply system context if no web request context exists (Async/Background)
            applySystemIdentity(template);
        }
    }

    /**
     * For RestTemplate
     */
    @Override
    @NonNull
    public ClientHttpResponse intercept(@NonNull HttpRequest request, @NonNull byte[] body, @NonNull ClientHttpRequestExecution execution) throws IOException {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest currentRequest = attributes.getRequest();
            copyHeaderIfPresent(currentRequest, request, HEADER_EMAIL);
            copyHeaderIfPresent(currentRequest, request, HEADER_ROLE);
            copyHeaderIfPresent(currentRequest, request, HEADER_PROFILE_ID);
            copyHeaderIfPresent(currentRequest, request, HEADER_DEALER_ID);
        } else {
            // Apply system context
            request.getHeaders().set(HEADER_EMAIL, SYSTEM_EMAIL);
            request.getHeaders().set(HEADER_ROLE, SYSTEM_ROLE);
        }
        return execution.execute(request, body);
    }

    private void propagateHeader(HttpServletRequest source, RequestTemplate target, String headerName) {
        String value = source.getHeader(headerName);
        if (value != null && !value.isEmpty()) {
            target.header(headerName, value);
        }
    }

    private void copyHeaderIfPresent(HttpServletRequest source, HttpRequest target, String headerName) {
        String value = source.getHeader(headerName);
        if (value != null && !value.isEmpty()) {
            target.getHeaders().set(headerName, value);
        }
    }

    private void applySystemIdentity(RequestTemplate template) {
        template.header(HEADER_EMAIL, SYSTEM_EMAIL);
        template.header(HEADER_ROLE, SYSTEM_ROLE);
    }
}
