package com.ev.inventory_service.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GatewayHeaderFilter Unit Tests")
class GatewayHeaderFilterTest {

    private GatewayHeaderFilter gatewayHeaderFilter;

    @Mock
    private HttpServletRequest request;
    @Mock
    private HttpServletResponse response;
    @Mock
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        gatewayHeaderFilter = new GatewayHeaderFilter();
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should set authentication when valid headers are present")
    void doFilterInternal_Success() throws Exception {
        // Given
        when(request.getHeader("X-User-Email")).thenReturn("user@ev.com");
        when(request.getHeader("X-User-Role")).thenReturn("ADMIN,EVM_STAFF");
        when(request.getHeader("X-User-Id")).thenReturn("user-123");
        when(request.getHeader("X-User-ProfileId")).thenReturn("prof-456");
        when(request.getHeaderNames()).thenReturn(Collections.enumeration(List.of("X-User-Email", "X-User-Role")));

        // When
        gatewayHeaderFilter.doFilterInternal(request, response, filterChain);

        // Then
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getName()).isEqualTo("user@ev.com");
        assertThat(auth.getAuthorities()).hasSize(2);
        assertThat(auth.getAuthorities().stream().map(a -> a.getAuthority()).toList())
                .containsExactlyInAnyOrder("ROLE_ADMIN", "ROLE_EVM_STAFF");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should not set authentication when email header is missing")
    void doFilterInternal_NoEmail() throws Exception {
        // Given
        when(request.getHeader("X-User-Email")).thenReturn(null);
        when(request.getHeaderNames()).thenReturn(Collections.emptyEnumeration());

        // When
        gatewayHeaderFilter.doFilterInternal(request, response, filterChain);

        // Then
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should handle empty role header gracefully")
    void doFilterInternal_EmptyRole() throws Exception {
        // Given
        when(request.getHeader("X-User-Email")).thenReturn("user@ev.com");
        when(request.getHeader("X-User-Role")).thenReturn("");
        when(request.getHeaderNames()).thenReturn(Collections.enumeration(List.of("X-User-Email", "X-User-Role")));

        // When
        gatewayHeaderFilter.doFilterInternal(request, response, filterChain);

        // Then
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getAuthorities()).isEmpty();
        verify(filterChain).doFilter(request, response);
    }
}
