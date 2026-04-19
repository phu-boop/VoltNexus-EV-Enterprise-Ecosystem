package com.ev.user_service.security;

import com.ev.user_service.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("userSecurity")
public class UserSecurity {

    private final UserRepository userRepository;

    public UserSecurity(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Kiểm tra xem user hiện tại có phải là chủ sở hữu của ID này, 
     * hoặc có quyền ADMIN phân quyền hay không.
     */
    public boolean isOwnerOrAdmin(Authentication authentication, UUID targetId) {
        if (authentication == null || authentication.getName() == null) {
            return false;
        }

        // Nếu là ADMIN -> Cho phép luôn
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return true;
        }

        // So khớp Email của người dùng gửi request với dữ liệu ở database
        return userRepository.findById(targetId)
                .map(user -> user.getEmail().equals(authentication.getName()))
                .orElse(false);
    }
}
