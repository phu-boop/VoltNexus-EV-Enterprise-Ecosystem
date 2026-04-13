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

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("JwtAuthenticationFilter Unit Tests")
class JwtAuthenticationFilterTest {

    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Mock
    private HttpServletRequest request;
    @Mock
    private HttpServletResponse response;
    @Mock
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        jwtAuthenticationFilter = new JwtAuthenticationFilter();
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should set authentication when valid headers are present")
    void doFilterInternal_Success() throws Exception {
        // Given
        when(request.getHeader("X-User-Email")).thenReturn("user@ev.com");
        when(request.getHeader("X-User-Role")).thenReturn("ADMIN");

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getName()).isEqualTo("user@ev.com");
        assertThat(auth.getAuthorities()).hasSize(1);
        assertThat(auth.getAuthorities().stream().map(a -> a.getAuthority()).toList())
                .containsExactly("ROLE_ADMIN");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should not set authentication when email header is missing")
    void doFilterInternal_NoEmail() throws Exception {
        // Given
        when(request.getHeader("X-User-Email")).thenReturn(null);
        when(request.getHeader("X-User-Role")).thenReturn("ADMIN");

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("Should not set authentication when role header is missing")
    void doFilterInternal_NoRole() throws Exception {
        // Given
        when(request.getHeader("X-User-Email")).thenReturn("user@ev.com");
        when(request.getHeader("X-User-Role")).thenReturn(null);

        // When
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        // Then
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNull();
        verify(filterChain).doFilter(request, response);
    }
}
