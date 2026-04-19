package com.ev.user_service.security;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class GitHubOAuth2UserService extends DefaultOAuth2UserService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = new HashMap<>(oauth2User.getAttributes());

        if ("github".equals(userRequest.getClientRegistration().getRegistrationId())) {
            String email = (String) attributes.get("email");

            if (email == null) {
                // Gọi endpoint /user/emails
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(userRequest.getAccessToken().getTokenValue());
                HttpEntity<String> entity = new HttpEntity<>(headers);

                ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                        "https://api.github.com/user/emails",
                        HttpMethod.GET,
                        entity,
                        (Class<List<Map<String, Object>>>) (Class<?>) List.class
                );

                List<Map<String, Object>> emails = response.getBody();
                if (emails != null) {
                    Optional<String> primaryEmail = emails.stream()
                        .filter(e -> Boolean.TRUE.equals(e.get("primary")) && Boolean.TRUE.equals(e.get("verified")))
                        .map(e -> (String) e.get("email"))
                        .findFirst();
                    primaryEmail.ifPresent(e -> attributes.put("email", e));
                }
            }
        }

        return new DefaultOAuth2User(
                oauth2User.getAuthorities(),
                attributes,
                "id"
        );
    }
}
