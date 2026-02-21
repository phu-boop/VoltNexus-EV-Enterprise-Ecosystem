package com.ev.user_service.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.util.Arrays;
import java.util.Base64;
import java.util.List;

@Configuration
public class OAuth2RedirectConfig {

    @Value("${oauth2.allowed.origins}")
    private String allowedOrigins;

    @Bean
    public OAuth2AuthorizationRequestResolver customAuthorizationRequestResolver(
            ClientRegistrationRepository clientRegistrationRepository) {

        DefaultOAuth2AuthorizationRequestResolver defaultResolver =
                new DefaultOAuth2AuthorizationRequestResolver(
                        clientRegistrationRepository, "/oauth2/authorization");

        return new OAuth2AuthorizationRequestResolver() {
            @Override
            public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
                OAuth2AuthorizationRequest authorizationRequest = defaultResolver.resolve(request);
                return authorizationRequest != null ? 
                    customizeAuthorizationRequest(authorizationRequest, request) : null;
            }

            @Override
            public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
                OAuth2AuthorizationRequest authorizationRequest = 
                    defaultResolver.resolve(request, clientRegistrationId);
                return authorizationRequest != null ? 
                    customizeAuthorizationRequest(authorizationRequest, request) : null;
            }
        };
    }

    private OAuth2AuthorizationRequest customizeAuthorizationRequest(
            OAuth2AuthorizationRequest authorizationRequest,
            HttpServletRequest request) {
        
        String redirectUri = request.getParameter("redirect_uri");
        
        String state = authorizationRequest.getState();
        
        if (redirectUri != null && !redirectUri.isEmpty()) {
            // Validate redirect_uri với whitelist
            List<String> allowedOriginList = Arrays.asList(allowedOrigins.split(","));
            boolean isAllowed = allowedOriginList.stream()
                .anyMatch(origin -> redirectUri.trim().startsWith(origin.trim()));
            
            
            if (isAllowed) {
                // Encode redirect_uri vào state parameter
                // Format: state|base64(redirect_uri)
                String encodedRedirectUri = Base64.getUrlEncoder().encodeToString(redirectUri.getBytes());
                state = authorizationRequest.getState() + "|" + encodedRedirectUri;
            } else {
                System.err.println("[SECURITY BLOCK] Invalid redirect_uri: " + redirectUri);
            }
        } else {
        }
        
        return OAuth2AuthorizationRequest.from(authorizationRequest)
                .state(state)
                .build();
    }
}
