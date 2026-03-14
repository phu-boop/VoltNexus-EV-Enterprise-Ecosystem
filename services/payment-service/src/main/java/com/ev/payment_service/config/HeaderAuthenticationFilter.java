package com.ev.payment_service.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Đọc các header X-User-* (do Gateway thêm vào)
 * và tạo một Authentication object chuẩn cho Spring Security.
 */
public class HeaderAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(HeaderAuthenticationFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestPath = request.getRequestURI();
        String requestMethod = request.getMethod();

        // Log ngay từ đầu để đảm bảo filter được gọi
        log.info("[HeaderAuthFilter] ===== FILTER CALLED ===== Request: {} {}", requestMethod, requestPath);
        // BỎ QUA favicon.ico
        if ("/favicon.ico".equals(requestPath)) {
            log.debug("[HeaderAuthFilter] Skipping /favicon.ico request");
            filterChain.doFilter(request, response);
            return;
        }
        // 1. Đọc các header tin cậy từ Gateway
        String email = request.getHeader("X-User-Email");
        String role = request.getHeader("X-User-Role"); // Ví dụ: "ADMIN" hoặc "EVM_STAFF"
        // Gateway gửi header là "X-User-ProfileId" (không có dấu gạch ngang)
        String profileIdStr = request.getHeader("X-User-ProfileId");
        // String dealerIdStr = request.getHeader("X-User-Dealer-Id"); // (Sẽ cần cho Giai đoạn 3)

        // Log tất cả headers để debug
        log.info("[HeaderAuthFilter] Request: {} {} | Headers - Email: {}, Role: {}, ProfileId: {}", 
                requestMethod, requestPath, email, role, profileIdStr);

        // Log tất cả headers có sẵn
        java.util.Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            if (headerName.startsWith("X-User-")) {
                log.info("[HeaderAuthFilter] Header {} = {}", headerName, request.getHeader(headerName));
            }
        }

        // 2. Nếu không có header (request public), cứ cho qua
        if (email == null || role == null || profileIdStr == null) {
            log.warn("[HeaderAuthFilter] Missing headers - Email: {}, Role: {}, ProfileId: {} | Allowing request to proceed (public endpoint)", 
                    email, role, profileIdStr);
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 3. TẠO PRINCIPAL (Đối tượng người dùng)
            UserPrincipal principal = UserPrincipal.builder()
                    .email(email)
                    .role(role)
                    .profileId(UUID.fromString(profileIdStr))
                    // .dealerId(dealerIdStr != null ? UUID.fromString(dealerIdStr) : null)
                    .build();

            // Log authorities được tạo
            var authorities = principal.getAuthorities();
            log.info("[HeaderAuthFilter] Creating authentication for user: {} | Role: {} | Authorities: {}", 
                    email, role, authorities);

            // 4. Tạo "Giấy thông hành"
            // LƯU Ý: Chúng ta dùng UserPrincipal làm principal
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    principal,  // << QUAN TRỌNG: Dùng object, không dùng String
                    null,
                    authorities
            );

            // 5. Đặt vào SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.info("[HeaderAuthFilter] Authentication set successfully for user: {} | Authorities: {}", 
                    email, authorities);

        } catch (Exception e) {
            log.error("[HeaderAuthFilter] Failed to process authentication headers for path: {} | Error: {}", 
                    requestPath, e.getMessage(), e);
            SecurityContextHolder.clearContext();
        }

        // 6. Cho request đi tiếp
        log.info("[HeaderAuthFilter] ===== FILTER COMPLETED ===== Request: {} {}", requestMethod, requestPath);
        filterChain.doFilter(request, response);
    }
}