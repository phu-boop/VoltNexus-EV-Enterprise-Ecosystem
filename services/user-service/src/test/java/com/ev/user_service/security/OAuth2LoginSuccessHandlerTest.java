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

import com.ev.user_service.dto.respond.UserRespond;
import com.ev.user_service.entity.Role;
import com.ev.user_service.enums.RoleName;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
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
                                "given_name", "Test",
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
                when(userMapper.usertoUserRespond(any())).thenReturn(new UserRespond());
                when(jwtUtil.generateAccessToken(anyString(), anyString(), anyString(), any(), any()))
                                .thenReturn("access-token");
                when(jwtUtil.generateRefreshToken(anyString(), anyString(), anyString(), any(), any()))
                                .thenReturn("refresh-token");
                when(request.getParameter("state")).thenReturn(null);

                successHandler.onAuthenticationSuccess(request, response, authentication);

                verify(response).sendRedirect(contains("accessToken=access-token"));
                verify(response).addCookie(any());
        }

        @Test
        void onAuthenticationSuccess_NewUser() throws Exception {
                Role customerRole = new Role();
                customerRole.setName(RoleName.CUSTOMER.getRoleName());

                when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
                when(roleRepository.findByName(RoleName.CUSTOMER.getRoleName())).thenReturn(Optional.of(customerRole));
                when(userRepository.save(any(User.class))).thenAnswer(inv -> {
                        User u = inv.getArgument(0);
                        u.setId(UUID.randomUUID());
                        return u;
                });
                when(userMapper.usertoUserRespond(any())).thenReturn(new UserRespond());
                when(jwtUtil.generateAccessToken(anyString(), anyString(), anyString(), any(), any()))
                                .thenReturn("access-token");
                when(jwtUtil.generateRefreshToken(anyString(), anyString(), anyString(), any(), any()))
                                .thenReturn("refresh-token");
                when(request.getParameter("state")).thenReturn(null);

                successHandler.onAuthenticationSuccess(request, response, authentication);

                verify(userRepository).save(any(User.class));
                verify(customerProfileService).saveCustomerProfile(any(), any());
                verify(response).sendRedirect(contains("accessToken="));
        }

        @Test
        void onAuthenticationSuccess_WithCustomerProfile() throws Exception {
                User user = new User();
                user.setId(UUID.randomUUID());
                user.setEmail("test@example.com");
                Role customerRole = new Role();
                customerRole.setName(RoleName.CUSTOMER.getRoleName());
                user.setRoles(Set.of(customerRole));

                com.ev.user_service.entity.CustomerProfile cp = new com.ev.user_service.entity.CustomerProfile();
                cp.setCustomerId(UUID.randomUUID());

                when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
                when(userMapper.usertoUserRespond(any())).thenReturn(new UserRespond());
                when(customerProfileRepository.findByUserId(any())).thenReturn(Optional.of(cp));
                when(jwtUtil.generateAccessToken(anyString(), anyString(), anyString(), any(), any()))
                                .thenReturn("access-token");
                when(jwtUtil.generateRefreshToken(anyString(), anyString(), anyString(), any(), any()))
                                .thenReturn("refresh-token");
                when(request.getParameter("state")).thenReturn(null);

                successHandler.onAuthenticationSuccess(request, response, authentication);

                verify(customerProfileRepository).findByUserId(any());
                verify(response).sendRedirect(contains("accessToken="));
        }

        @Test
        void onAuthenticationSuccess_WithValidRedirectUri() throws Exception {
                User user = new User();
                user.setId(UUID.randomUUID());
                user.setEmail("test@example.com");
                user.setRoles(Collections.emptySet());

                String base64Redirect = java.util.Base64.getUrlEncoder()
                                .encodeToString("http://localhost:3000/callback".getBytes());

                when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
                when(userMapper.usertoUserRespond(any())).thenReturn(new UserRespond());
                when(jwtUtil.generateAccessToken(anyString(), anyString(), anyString(), any(), any()))
                                .thenReturn("access-token");
                when(jwtUtil.generateRefreshToken(anyString(), anyString(), anyString(), any(), any()))
                                .thenReturn("refresh-token");
                when(request.getParameter("state")).thenReturn("someState|" + base64Redirect);

                successHandler.onAuthenticationSuccess(request, response, authentication);

                verify(response).sendRedirect(contains("http://localhost:3000/callback"));
        }

        @Test
        void onAuthenticationSuccess_WithNonCustomerHavingProfileId() throws Exception {
                User user = new User();
                user.setId(UUID.randomUUID());
                user.setEmail("test@example.com");
                com.ev.user_service.entity.DealerStaffProfile staffProfile = new com.ev.user_service.entity.DealerStaffProfile();
                staffProfile.setStaffId(UUID.randomUUID());
                user.setDealerStaffProfile(staffProfile);
                Role staffRole = new Role();
                staffRole.setName("DEALER_STAFF");
                user.setRoles(Set.of(staffRole));

                when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
                when(userMapper.usertoUserRespond(any())).thenReturn(new UserRespond());
                when(jwtUtil.generateAccessToken(anyString(), anyString(), anyString(), any(), any()))
                                .thenReturn("access-token");
                when(jwtUtil.generateRefreshToken(anyString(), anyString(), anyString(), any(), any()))
                                .thenReturn("refresh-token");
                when(request.getParameter("state")).thenReturn(null);

                successHandler.onAuthenticationSuccess(request, response, authentication);

                verify(response).sendRedirect(contains("accessToken="));
        }
}
