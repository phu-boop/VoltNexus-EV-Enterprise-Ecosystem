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
import static org.junit.jupiter.api.Assertions.assertNotNull;
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
    @SuppressWarnings("unchecked")
    void testSecurityFilterChain() throws Exception {
        // We need to ensure the lambdas passed to httpSecurity are actually executed
        doAnswer(invocation -> {
            org.springframework.security.config.Customizer<org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry> customizer = invocation
                    .getArgument(0);
            customizer.customize(mock(
                    org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer.AuthorizationManagerRequestMatcherRegistry.class,
                    Answers.RETURNS_DEEP_STUBS));
            return httpSecurity;
        }).when(httpSecurity).authorizeHttpRequests(any());

        doAnswer(invocation -> {
            org.springframework.security.config.Customizer<org.springframework.security.config.annotation.web.configurers.ExceptionHandlingConfigurer<HttpSecurity>> customizer = invocation
                    .getArgument(0);
            customizer.customize(mock(
                    org.springframework.security.config.annotation.web.configurers.ExceptionHandlingConfigurer.class,
                    Answers.RETURNS_DEEP_STUBS));
            return httpSecurity;
        }).when(httpSecurity).exceptionHandling(any());

        when(httpSecurity.addFilterBefore(any(), any())).thenReturn(httpSecurity);
        when(httpSecurity.build()).thenReturn(mock(DefaultSecurityFilterChain.class));

        SecurityFilterChain result = productionSecurityConfig.securityFilterChain(httpSecurity);
        assertNotNull(result);
        verify(httpSecurity).build();
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
