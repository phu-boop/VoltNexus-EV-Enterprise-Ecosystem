package com.ev.user_service.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import com.ev.user_service.dto.respond.LoginRespond;
import com.ev.user_service.dto.respond.UserRespond;
import com.ev.user_service.entity.Role;
import com.ev.user_service.entity.User;
import com.ev.user_service.enums.RoleName;
import com.ev.user_service.enums.UserStatus;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.user_service.mapper.UserMapper;
import com.ev.user_service.repository.RoleRepository;
import com.ev.user_service.repository.UserRepository;
import com.ev.user_service.repository.CustomerProfileRepository;
import com.ev.user_service.service.CustomerProfileService;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final String urlFrontend;
    private final CustomerProfileService customerProfileService;
    private final CustomerProfileRepository customerProfileRepository;


    OAuth2LoginSuccessHandler(JwtUtil jwtUtil, UserRepository userRepository, RoleRepository roleRepository, UserMapper userMapper, @Value("${frontend.url}") String urlFrontend, CustomerProfileService customerProfileService, CustomerProfileRepository customerProfileRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userMapper = userMapper;
        this.urlFrontend = urlFrontend;
        this.customerProfileService = customerProfileService;
        this.customerProfileRepository = customerProfileRepository;
    }


    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        // Lấy thông tin user từ Google
        var oauthUser = (DefaultOAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        String givenName = oauthUser.getAttribute("given_name");
        //String picture = oauthUser.getAttribute("picture");

        Set<Role> roles = new HashSet<>();
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            // Assign CUSTOMER role for customer-app OAuth users
            roles.add(roleRepository.findByName(RoleName.CUSTOMER.getRoleName())
                    .orElseThrow(() -> new AppException(ErrorCode.DATABASE_ERROR)));
            
            User newUser = User.builder()
                    .email(email)
                    .name(givenName)
                    .fullName(name)
                    .roles(roles)
                    .status(UserStatus.ACTIVE)
                    .build();
            
            User savedUser = userRepository.save(newUser);
            
            // Create customer profile with Bronze tier
            customerProfileService.saveCustomerProfile(savedUser, null);
            
            return savedUser;
        });

        String accessToken = jwtUtil.generateAccessToken(user.getEmail(), user.getRoleToString(), null, null);
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail(), user.getRoleToString(), null, null);


        // Set refresh token trong cookie HttpOnly
        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(30 * 24 * 60 * 60);
        response.addCookie(cookie);

        // Map user to UserRespond
        UserRespond userRespond = userMapper.usertoUserRespond(user);
        
        // Fetch customer profile and set memberId if user is a CUSTOMER
        try {
            if (user.getRoleToString().contains("CUSTOMER")) {
                // Explicitly fetch customer profile from repository (avoid lazy loading issue)
                var customerProfile = customerProfileRepository.findByUserId(user.getId());
                if (customerProfile.isPresent()) {
                    userRespond.setMemberId(customerProfile.get().getCustomerId());
                } else {
                }
            }
        } catch (Exception e) {
            System.err.println("[OAuth2LoginSuccessHandler] ❌ Error fetching customer profile: " + e.getMessage());
        }
        
        LoginRespond loginRespond = new LoginRespond(userRespond, accessToken);

        ApiRespond<Object> apiResponse = ApiRespond.success("Login with Google success", loginRespond);

        // Lấy redirect_uri từ state parameter (format: originalState|base64(redirect_uri))
        String redirectUri = extractRedirectUriFromRequest(request);
        
        
        if (redirectUri == null || redirectUri.isEmpty()) {
            redirectUri = urlFrontend;
        } else {
        }
        
        response.sendRedirect(redirectUri + "/oauth-success?accessToken=" + accessToken);

    }
    
    private String extractRedirectUriFromRequest(HttpServletRequest request) {
        try {
            // Get state parameter from request (sent back by Google OAuth)
            String state = request.getParameter("state");
            
            if (state != null && state.contains("|")) {
                // Format: originalState|base64(redirect_uri)
                String[] parts = state.split("\\|", 2);
                if (parts.length == 2) {
                    String encodedRedirectUri = parts[1];
                    byte[] decodedBytes = java.util.Base64.getUrlDecoder().decode(encodedRedirectUri);
                    String redirectUri = new String(decodedBytes);
                    return redirectUri;
                }
            }
            
            return null;
        } catch (Exception e) {
            System.err.println("[OAuth2LoginSuccessHandler] Error extracting redirect_uri: " + e.getMessage());
            return null;
        }
    }
}
