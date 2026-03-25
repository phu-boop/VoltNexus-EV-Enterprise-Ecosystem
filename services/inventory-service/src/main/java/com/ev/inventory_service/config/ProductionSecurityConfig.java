package com.ev.inventory_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.ev.common_lib.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.access.AccessDeniedHandler;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Profile("docker")
public class ProductionSecurityConfig {

    private static final String ROLE_EVM_STAFF = "ROLE_EVM_STAFF";
    private static final String ROLE_ADMIN = "ROLE_ADMIN";
    private static final String ROLE_DEALER_MANAGER = "ROLE_DEALER_MANAGER";
    private static final String ROLE_DEALER_STAFF = "ROLE_DEALER_STAFF";

    private final GatewayHeaderFilter gatewayHeaderFilter;

    @Autowired
    public ProductionSecurityConfig(GatewayHeaderFilter gatewayHeaderFilter) {
        this.gatewayHeaderFilter = gatewayHeaderFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // In môi trường dev, cho phép tất cả request đi qua

        http
                // .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Internal & Service endpoints
                        .requestMatchers(HttpMethod.POST, "/inventory/status-by-ids-detailed",
                                "/inventory/status-by-ids", "/inventory/allocate-sync")
                        .permitAll() // Trusted internal calls (optionally can be Restricted by IP)

                        .requestMatchers(HttpMethod.GET, "/inventory/", "/inventory/**")
                        .hasAnyRole("DEALER_STAFF", "DEALER_MANAGER", "EVM_STAFF", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/inventory/transactions")
                        .hasAnyAuthority(ROLE_EVM_STAFF, ROLE_ADMIN)

                        .requestMatchers(HttpMethod.POST, "/inventory/transactions")
                        .hasAnyAuthority(ROLE_EVM_STAFF, ROLE_ADMIN)

                        .requestMatchers(HttpMethod.PUT, "/inventory/central-stock/**")
                        .hasAnyAuthority(ROLE_EVM_STAFF, ROLE_ADMIN)

                        .requestMatchers(HttpMethod.POST, "/inventory/allocate")
                        .hasAnyAuthority(ROLE_EVM_STAFF, ROLE_ADMIN)

                        .requestMatchers(HttpMethod.POST, "/inventory/ship-b2b")
                        .hasAnyAuthority(ROLE_EVM_STAFF, ROLE_ADMIN)

                        // dealer
                        .requestMatchers(HttpMethod.GET, "/inventory/my-stock")
                        .hasAnyAuthority(ROLE_DEALER_MANAGER, ROLE_DEALER_STAFF)

                        .requestMatchers(HttpMethod.PUT, "/inventory/dealer-stock/**")
                        .hasAnyAuthority(ROLE_DEALER_MANAGER)

                        .requestMatchers(HttpMethod.GET, "/inventory/variants/ids-by-status",
                                "/inventory/analytics/snapshots")
                        .hasAnyAuthority(ROLE_EVM_STAFF, ROLE_ADMIN)

                        .requestMatchers(HttpMethod.GET, "/inventory/report/export")
                        .hasAnyAuthority(ROLE_EVM_STAFF, ROLE_ADMIN)

                        .requestMatchers(HttpMethod.POST, "/inventory/return-by-order")
                        .hasAnyAuthority(ROLE_EVM_STAFF, ROLE_ADMIN)

                        .requestMatchers(HttpMethod.POST, "/inventory/vehicles/validate-vins")
                        .hasAnyAuthority(ROLE_EVM_STAFF, ROLE_ADMIN)

                        .requestMatchers(HttpMethod.GET, "/inventory/vehicles/available-vins")
                        .hasAnyAuthority(ROLE_EVM_STAFF, ROLE_ADMIN)

                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex.accessDeniedHandler(accessDeniedHandler()))
                .addFilterBefore(gatewayHeaderFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(ErrorCode.FORBIDDEN.getHttpStatus().value());
            response.setContentType("application/json;charset=UTF-8");
            String body = String.format("{\"code\":\"%s\",\"message\":\"%s\",\"status\":\"ERROR\"}",
                    ErrorCode.FORBIDDEN.getCode(),
                    ErrorCode.FORBIDDEN.getMessage());
            response.getWriter().write(body);
        };
    }
}