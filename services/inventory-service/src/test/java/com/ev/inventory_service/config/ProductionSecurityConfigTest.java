package com.ev.inventory_service.config;

import com.ev.common_lib.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

import java.io.PrintWriter;
import java.io.StringWriter;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.mockito.Answers;

import org.springframework.security.web.DefaultSecurityFilterChain;

@ExtendWith(MockitoExtension.class)
class ProductionSecurityConfigTest {

    @Mock
    private GatewayHeaderFilter gatewayHeaderFilter;

    @Mock(answer = Answers.RETURNS_DEEP_STUBS)
    private HttpSecurity httpSecurity;

    @InjectMocks
    private ProductionSecurityConfig productionSecurityConfig;

    @Test
    void testSecurityFilterChain() throws Exception {
        when(httpSecurity.csrf(any())).thenReturn(httpSecurity);

        SecurityFilterChain result = productionSecurityConfig.securityFilterChain(httpSecurity);
    }

    @Test
    void testAccessDeniedHandler() throws Exception {
        AccessDeniedHandler handler = productionSecurityConfig.accessDeniedHandler();

        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        AccessDeniedException exception = new AccessDeniedException("Access Denied");

        StringWriter stringWriter = new StringWriter();
        PrintWriter writer = new PrintWriter(stringWriter);
        when(response.getWriter()).thenReturn(writer);

        handler.handle(request, response, exception);

        verify(response).setStatus(ErrorCode.FORBIDDEN.getHttpStatus().value());
        verify(response).setContentType("application/json;charset=UTF-8");

        writer.flush();
        String responseBody = stringWriter.toString();

        assertTrue(responseBody.contains(ErrorCode.FORBIDDEN.getCode()));
        assertTrue(responseBody.contains(ErrorCode.FORBIDDEN.getMessage()));
        assertTrue(responseBody.contains("ERROR"));
    }
}
