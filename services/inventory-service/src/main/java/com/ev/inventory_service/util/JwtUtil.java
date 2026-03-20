package com.ev.inventory_service.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    // Lấy secret key 
    @Value("${jwt.secret-key}")
    private String secret;

    /**
     * Hàm mới để lấy email (từ claim "sub") của token.
     */
    public String extractEmail(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid Authorization Header");
        }
        String jwt = authorizationHeader.substring(7);

        Claims claims = Jwts.parserBuilder()
                            .setSigningKey(secret.getBytes())
                            .build()
                            .parseClaimsJws(jwt)
                            .getBody();
        
        // getSubject() sẽ lấy giá trị của claim "sub"
        return claims.getSubject();
    }

//=====================XỬ LÝ JWT ĐỂ LẤY USER_ID==========================
    /**
     * Hàm chính để lấy userId từ header Authorization
     * @param authorizationHeader 
     * @return Long userId
     */
    // public Long extractUserId(String authorizationHeader) {
    //     // 1. Kiểm tra header hợp lệ và bắt đầu bằng "Bearer "
    //     if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
    //         throw new IllegalArgumentException("Invalid Authorization Header");
    //     }

    //     // 2. Cắt bỏ tiền tố "Bearer " để lấy chuỗi JWT
    //     String jwt = authorizationHeader.substring(7);

    //     // 3. Giải mã token để lấy claims
    //     Claims claims = Jwts.parserBuilder()
    //                         .setSigningKey(secret.getBytes()) // Dùng secret key để xác thực
    //                         .build()
    //                         .parseClaimsJws(jwt)
    //                         .getBody();

    //     // 4. Lấy giá trị của claim "userId"
    //     return claims.get("userId", Long.class);
    // }
}