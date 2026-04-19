package com.ev.user_service.service;

import com.ev.user_service.entity.DealerStaffProfile;
import com.ev.user_service.entity.User;
import com.ev.user_service.repository.AdminProfileRepository;
import com.ev.user_service.repository.DealerStaffProfileRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class DealerStaffProfileService {

    private final DealerStaffProfileRepository dealerStaffProfileRepository;

    public DealerStaffProfileService(DealerStaffProfileRepository dealerStaffProfileRepository){
        this.dealerStaffProfileRepository = dealerStaffProfileRepository;
    }

    public DealerStaffProfile SaveDealerStaffProfile(User user, UUID dealerId, String position, String department, LocalDate hireDate, BigDecimal salary, BigDecimal commissionRate){

        DealerStaffProfile dealerStaffProfile = DealerStaffProfile.builder()
                .user(user)
                .dealerId(dealerId)
                .position(position)
                .department(department)
                .hireDate(hireDate)
                .salary(salary)
                .commissionRate(commissionRate)
                .build();
        return dealerStaffProfileRepository.save(dealerStaffProfile);
    }
}
