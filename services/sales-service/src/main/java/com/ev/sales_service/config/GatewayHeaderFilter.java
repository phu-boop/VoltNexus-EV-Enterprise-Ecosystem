//package com.ev.sales_service.config;
//
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Component;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//import java.util.*;
//import java.util.stream.Collectors;
//
//@Component
//public class GatewayHeaderFilter extends OncePerRequestFilter {
//
//    private static final Logger log = LoggerFactory.getLogger(GatewayHeaderFilter.class); // Thêm logger
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request,
//                                    HttpServletResponse response,
//                                    FilterChain filterChain)
//            throws ServletException, IOException {
//
//        // Log các header nhận được để kiểm tra
//        log.debug("--- GatewayHeaderFilter: Received Headers for {} ---", request.getRequestURI());
//        Collections.list(request.getHeaderNames())
//                .forEach(headerName -> log.debug("{}: {}", headerName, request.getHeader(headerName)));
//        log.debug("-------------------------------------------");
//
//        String email = request.getHeader("X-User-Email");
//        // Đọc header role vào biến riêng
//        String roleHeader = request.getHeader("X-User-Role");
//        String userId = request.getHeader("X-User-Id");
//        String profileId = request.getHeader("X-User-ProfileId");
//
//        // Chỉ xử lý nếu có email. Cho phép ghi đè AnonymousAuthenticationToken
//        if (email != null && !email.isEmpty()) {
//            var currentAuth = SecurityContextHolder.getContext().getAuthentication();
//            if (currentAuth != null && !(currentAuth instanceof org.springframework.security.authentication.AnonymousAuthenticationToken)) {
//                log.debug("SecurityContext already contains non-anonymous Authentication");
//                filterChain.doFilter(request, response);
//                return;
//            }
//            log.debug("Setting SecurityContext for user: {}", email);
//
//            List<GrantedAuthority> authorities;
//
//
//            if (roleHeader != null && !roleHeader.trim().isEmpty()) {
//                try {
//
//                    authorities = Arrays.stream(roleHeader.split(","))
//                            .map(String::trim)
//                            .filter(r -> !r.isEmpty())
//                            .map(r -> new SimpleGrantedAuthority("ROLE_" + r.toUpperCase()))
//                            .collect(Collectors.toList());
//                    log.debug("Extracted authorities: {}", authorities);
//                } catch (Exception e) {
//                     log.error("Error parsing roles from header '{}': {}", roleHeader, e.getMessage());
//                     authorities = Collections.emptyList(); // Gán rỗng nếu lỗi parse
//                }
//            } else {
//                // Xử lý khi header role bị thiếu/rỗng
//                log.warn("X-User-Role header is missing or empty for user: {}. Setting empty authorities.", email);
//                authorities = Collections.emptyList(); // Gán danh sách quyền rỗng
//            }
//            // --- Kết thúc sửa lỗi ---
//
//            UsernamePasswordAuthenticationToken authToken =
//                    new UsernamePasswordAuthenticationToken(email, null, authorities);
//
//            // Lưu userId và profileId vào details (nên kiểm tra null)
//            Map<String, String> details = new HashMap<>();
//            if (userId != null) details.put("userId", userId);
//            if (profileId != null) details.put("profileId", profileId);
//            authToken.setDetails(details);
//            log.debug("Authentication details set: {}", details);
//
//
//            SecurityContextHolder.getContext().setAuthentication(authToken);
//            log.info("Successfully authenticated user {} with roles {}", email, authorities);
//
//        } else if (email == null || email.isEmpty()){
//             log.warn("X-User-Email header missing or empty for request to {}", request.getRequestURI());
//        } else {
//             log.debug("SecurityContext already contains Authentication");
//        }
//
//
//        filterChain.doFilter(request, response);
//    }
//}