package com.ev.user_service.service;

import com.ev.user_service.entity.DealerManagerProfile;
import com.ev.user_service.entity.DealerStaffProfile;
import com.ev.user_service.entity.User;
import com.ev.user_service.repository.DealerManagerProfileRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;


@Service
public class DealerManagerProfileService {

    private DealerManagerProfileRepository dealerManagerProfileRepository;

    public DealerManagerProfileService(DealerManagerProfileRepository dealerManagerProfileRepository){
        this.dealerManagerProfileRepository = dealerManagerProfileRepository;
    }

    @Transactional
    public DealerManagerProfile SaveDealerManagerProfile(User user, UUID dealerId, String managementLevel, BigDecimal approvalLimit, String department){
        DealerManagerProfile dealerManagerProfile = DealerManagerProfile.builder()
                .user(user)
                .dealerId(dealerId)
                .managementLevel(managementLevel)
                .approvalLimit(approvalLimit)
                .department(department)
                .build();
        return dealerManagerProfileRepository.save(dealerManagerProfile);
    }
}



