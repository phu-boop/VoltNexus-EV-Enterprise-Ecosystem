package com.ev.user_service.service;

import com.ev.user_service.entity.EvmStaffProfile;
import com.ev.user_service.entity.User;
import com.ev.user_service.repository.EvmStaffProfileRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class EvmStaffProfileService {

    private final EvmStaffProfileRepository evmStaffProfileRepository;

    EvmStaffProfileService(EvmStaffProfileRepository evmStaffProfileRepository){
        this.evmStaffProfileRepository = evmStaffProfileRepository;
    }

    @Transactional
    public EvmStaffProfile SaveEvmStaffProfile(User user, String department, String specialization){
        EvmStaffProfile evmStaffProfile = EvmStaffProfile.builder()
                .user(user)
                .department(department)
                .specialization(specialization)
                .build();
        return evmStaffProfileRepository.save(evmStaffProfile);
    }
}
