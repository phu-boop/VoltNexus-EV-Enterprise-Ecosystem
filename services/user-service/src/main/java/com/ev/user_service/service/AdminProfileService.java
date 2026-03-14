package com.ev.user_service.service;

import com.ev.user_service.entity.AdminProfile;
import com.ev.user_service.entity.User;
import com.ev.user_service.repository.AdminProfileRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class AdminProfileService {

    private final AdminProfileRepository adminProfileRepository;

    public AdminProfileService(AdminProfileRepository adminProfileRepository){
      this.adminProfileRepository = adminProfileRepository;
    };

    @Transactional
    public AdminProfile SaveAdminProfile(User user, String adminLevel, String systemPermissions, String accessScope){
        AdminProfile adminProfile = AdminProfile.builder()
                .user(user)
                .adminLevel(adminLevel)
                .systemPermissions(systemPermissions)
                .accessScope(accessScope)
                .build();
        return adminProfileRepository.save(adminProfile);
    }
}
