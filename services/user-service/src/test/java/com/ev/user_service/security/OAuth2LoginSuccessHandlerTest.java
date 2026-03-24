package com.ev.user_service.security;

import com.ev.user_service.entity.User;
import com.ev.user_service.mapper.UserMapper;
import com.ev.user_service.repository.CustomerProfileRepository;
import com.ev.user_service.repository.RoleRepository;
import com.ev.user_service.repository.UserRepository;
import com.ev.user_service.service.CustomerProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OAuth2LoginSuccessHandlerTest {

        @Mock
        private JwtUtil jwtUtil;

        @Mock
        private UserRepository userRepository;

        @Mock
        private RoleRepository roleRepository;

        @Mock
        private CustomerProfileService customerProfileService;

        @Mock
        private CustomerProfileRepository customerProfileRepository;

        @Mock
        private UserMapper userMapper;

        @InjectMocks
        private OAuth2LoginSuccessHandler successHandler;

        @Mock
        private HttpServletRequest request;

        @Mock
        private HttpServletResponse response;

        private OAuth2AuthenticationToken authentication;

        @BeforeEach
        void setUp() {
                ReflectionTestUtils.setField(successHandler, "urlFrontend", "http://localhost:3000");
                ReflectionTestUtils.setField(successHandler, "allowedOrigins", "http://localhost:3000");

                Map<String, Object> attributes = Map.of(
                                "email", "test@example.com",
                                "name", "Test User",
                                "picture", "http://example.com/pic.jpg");
                OAuth2User oAuth2User = new DefaultOAuth2User(Collections.emptyList(), attributes, "email");
                authentication = new OAuth2AuthenticationToken(oAuth2User, Collections.emptyList(), "google");
        }

        @Test
        void onAuthenticationSuccess_ExistingUser() throws Exception {
                User user = new User();
                user.setId(UUID.randomUUID());
                user.setEmail("test@example.com");
                user.setRoles(Collections.emptySet());

                when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
                when(jwtUtil.generateAccessToken(anyString(), anyString(), anyString(), any(), any()))
                                .thenReturn("access-token");
                when(jwtUtil.generateRefreshToken(anyString(), anyString(), anyString(), any(), any()))
                                .thenReturn("refresh-token");
                when(request.getParameter("state")).thenReturn("state|YmFzZTY0cmVkaXJlY3Q="); // base64 for "redirect"

                successHandler.onAuthenticationSuccess(request, response, authentication);

                verify(response).sendRedirect(contains("accessToken=access-token"));
                verify(response).addCookie(any());
        }
}
