package com.ev.user_service.service;

import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.user_service.dto.request.CustomerRegistrationRequest;
import com.ev.user_service.dto.respond.LoginRespond;
import com.ev.user_service.dto.respond.TokenPair;
import com.ev.user_service.dto.respond.UserRespond;
import com.ev.user_service.entity.CustomerProfile;
import com.ev.user_service.entity.DealerManagerProfile;
import com.ev.user_service.entity.DealerStaffProfile;
import com.ev.user_service.entity.Role;
import com.ev.user_service.entity.User;
import com.ev.user_service.enums.RoleName;
import com.ev.user_service.enums.UserStatus;
import com.ev.user_service.mapper.UserMapper;
import com.ev.user_service.repository.*;
import com.ev.user_service.security.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private UserMapper userMapper;
    @Mock
    private RedisService redisService;
    @Mock
    private EmailService emailService;
    @Mock
    private DealerManagerProfileRepository managerProfileRepository;
    @Mock
    private DealerStaffProfileRepository staffProfileRepository;
    @Mock
    private CustomerProfileService customerProfileService;
    @Mock
    private CustomerProfileRepository customerProfileRepository;
    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private AuthService authService;

    private User setupUser(String roleName) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("test@example.com");
        user.setPassword("encodedPassword");

        if ("CUSTOMER".equals(roleName)) {
            CustomerProfile cp = new CustomerProfile();
            cp.setCustomerId(UUID.randomUUID());
            user.setCustomerProfile(cp);
        } else if ("DEALER_MANAGER".equals(roleName)) {
            DealerManagerProfile dmp = new DealerManagerProfile();
            dmp.setManagerId(UUID.randomUUID());
            user.setDealerManagerProfile(dmp);
        } else if ("DEALER_STAFF".equals(roleName)) {
            DealerStaffProfile dsp = new DealerStaffProfile();
            dsp.setStaffId(UUID.randomUUID());
            user.setDealerStaffProfile(dsp);
        }

        Role role = new Role();
        role.setName(roleName);
        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        return user;
    }

    @Test
    void testLogin_Success_Customer() {
        User user = setupUser(RoleName.CUSTOMER.getName());
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateAccessToken(anyString(), anyString(), anyString(), anyString(), eq(null)))
                .thenReturn("accessToken");

        UserRespond mockRespond = new UserRespond();
        when(userMapper.usertoUserRespond(user)).thenReturn(mockRespond);

        LoginRespond respond = authService.login("test@example.com", "password");

        assertNotNull(respond);
        assertEquals("accessToken", respond.getToken());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testLogin_Success_DealerManager() {
        User user = setupUser("DEALER_MANAGER");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        DealerManagerProfile profile = new DealerManagerProfile();
        UUID dealerId = UUID.randomUUID();
        profile.setDealerId(dealerId);
        when(managerProfileRepository.findByUserId(user.getId())).thenReturn(Optional.of(profile));

        when(jwtUtil.generateAccessToken(anyString(), anyString(), anyString(), anyString(), anyString()))
                .thenReturn("accessToken");
        when(userMapper.usertoUserRespond(user)).thenReturn(new UserRespond());

        LoginRespond respond = authService.login("test@example.com", "password");

        assertNotNull(respond);
        assertEquals(dealerId, respond.getUserRespond().getDealerId());
    }

    @Test
    void testLogin_InvalidPassword() {
        User user = setupUser("CUSTOMER");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        AppException ex = assertThrows(AppException.class, () -> authService.login("test", "wrong"));
        assertEquals(ErrorCode.INVALID_PASSWORD, ex.getErrorCode());
    }

    @Test
    void testGetCurrentUser_Success() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("test@example.com", null, null));

        User user = setupUser("CUSTOMER");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(userMapper.usertoUserRespond(user)).thenReturn(new UserRespond());

        LoginRespond respond = authService.getCurrentUser();

        assertNotNull(respond);
        assertNull(respond.getToken()); // null for getCurrentUser
    }

    @Test
    void testNewRefreshTokenAndAccessToken_Success() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        Cookie cookie = new Cookie("refreshToken", "validToken");
        when(request.getCookies()).thenReturn(new Cookie[] { cookie });

        when(jwtUtil.validateToken("validToken")).thenReturn(true);
        when(redisService.contains("validToken")).thenReturn(false);
        when(jwtUtil.extractEmail(anyString())).thenReturn("test@example.com");
        when(jwtUtil.extractRole(anyString())).thenReturn("CUSTOMER");
        when(jwtUtil.extractUserId(anyString())).thenReturn(UUID.randomUUID().toString());
        when(jwtUtil.extractProfileId(anyString())).thenReturn(UUID.randomUUID().toString());
        when(jwtUtil.extractDealerId(anyString())).thenReturn(null);

        when(jwtUtil.generateAccessToken(any(), any(), any(), any(), any())).thenReturn("newAccess");
        when(jwtUtil.generateRefreshToken(any(), any(), any(), any(), any())).thenReturn("newRefresh");

        TokenPair pair = authService.newRefreshTokenAndAccessToken(request);

        assertNotNull(pair);
        assertEquals("newAccess", pair.getAccessToken());
        assertEquals("newRefresh", pair.getRefreshToken());
    }

    @Test
    void testAddTokenBlacklist_Success() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getHeader("Authorization")).thenReturn("Bearer access123");
        Cookie cookie = new Cookie("refreshToken", "refresh123");
        when(request.getCookies()).thenReturn(new Cookie[] { cookie });

        when(jwtUtil.validateToken("access123")).thenReturn(true);
        when(jwtUtil.validateToken("refresh123")).thenReturn(true);
        when(jwtUtil.getRemainingSeconds("refresh123")).thenReturn(100L);
        when(jwtUtil.getRemainingSeconds("access123")).thenReturn(50L);

        authService.addTokenBlacklist(request);

        verify(redisService, times(1)).addToken("refresh123", 100L);
        verify(redisService, times(1)).addToken("access123", 50L);
    }

    @Test
    void testSendOtp_Success() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(new User()));
        boolean result = authService.sendOtp("test@example.com");

        assertTrue(result);
        verify(redisService, times(1)).saveOtp(eq("test@example.com"), anyString(), eq(5L));
        verify(emailService, times(1)).sendOtpEmail(eq("test@example.com"), anyString());
    }

    @Test
    void testResetPassword_Success() {
        User user = setupUser("CUSTOMER");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));
        when(redisService.validateOtp("test@example.com", "123456")).thenReturn(true);
        when(passwordEncoder.encode("newPass")).thenReturn("encodedNewPass");

        boolean result = authService.resetPassword("test@example.com", "123456", "newPass");

        assertTrue(result);
        assertEquals("encodedNewPass", user.getPassword());
        verify(userRepository, times(1)).save(user);
        verify(redisService, times(1)).removeOtp("test@example.com");
    }

    @Test
    void testRegisterCustomer_Success() {
        CustomerRegistrationRequest request = new CustomerRegistrationRequest();
        request.setEmail("new@example.com");
        request.setPassword("password");
        request.setPhone("123456789");

        when(userRepository.existsByEmail("new@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("123456789")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");

        Role customerRole = new Role();
        customerRole.setName(RoleName.CUSTOMER.getName());
        when(roleRepository.findFirstByName(RoleName.CUSTOMER.getName())).thenReturn(Optional.of(customerRole));

        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userMapper.usertoUserRespond(any(User.class))).thenReturn(new UserRespond());

        UserRespond respond = authService.registerCustomer(request);

        assertNotNull(respond);
        verify(customerProfileService, times(1)).saveCustomerProfile(any(User.class), eq(null));
    }
}
