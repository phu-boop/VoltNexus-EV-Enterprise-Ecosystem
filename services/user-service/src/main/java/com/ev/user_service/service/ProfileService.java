package com.ev.user_service.service;

import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.user_service.controller.ProfileController;
import com.ev.user_service.dto.respond.ApiResponseStaffDealer;
import com.ev.user_service.entity.DealerManagerProfile;
import com.ev.user_service.entity.DealerStaffProfile;
import com.ev.user_service.repository.DealerManagerProfileRepository;
import com.ev.user_service.repository.DealerStaffProfileRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProfileService {
    private final DealerStaffProfileRepository dealerStaffProfileRepository;
    private final DealerManagerProfileRepository dealerManagerProfileRepository;

    public ProfileService(
            DealerStaffProfileRepository dealerStaffProfileRepository,
            DealerManagerProfileRepository dealerManagerProfileRepository
    ) {
        this.dealerManagerProfileRepository = dealerManagerProfileRepository;
        this.dealerStaffProfileRepository = dealerStaffProfileRepository;
    }

    public List<ApiResponseStaffDealer> getStaffDealerByIdDealer(UUID idDealer) {
        List<DealerStaffProfile> dealerStaffProfiles = dealerStaffProfileRepository.findByDealerId(idDealer);
        return dealerStaffProfiles.stream()
                .map(profile -> {
                    ApiResponseStaffDealer dto = new ApiResponseStaffDealer();

                    // mapping từ DealerStaffProfile
                    dto.setStaffId(profile.getStaffId());
                    dto.setDealerId(profile.getDealerId());
                    dto.setPosition(profile.getPosition());
                    dto.setDepartment(profile.getDepartment());
                    dto.setHireDate(profile.getHireDate());
                    dto.setSalary(profile.getSalary());
                    dto.setCommissionRate(profile.getCommissionRate());

                    // mapping từ User (vì có @OneToOne)
                    if (profile.getUser() != null) {
                        dto.setEmail(profile.getUser().getEmail());
                        dto.setName(profile.getUser().getName());
                        dto.setFullName(profile.getUser().getFullName());
                        dto.setPhone(profile.getUser().getPhone());
                        dto.setAddress(profile.getUser().getAddress());
                        dto.setBirthday(profile.getUser().getBirthday());
                        dto.setCity(profile.getUser().getCity());
                        dto.setCountry(profile.getUser().getCountry());
                        dto.setGender(profile.getUser().getGender());
                        dto.setStatus(profile.getUser().getStatus());
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }

    //find idealer by idMember
    public UUID getIdDealerByIdMember(UUID idMember) {
        Optional<DealerStaffProfile> staffOpt = dealerStaffProfileRepository.findById(idMember);
        Optional<DealerManagerProfile> managerOpt = dealerManagerProfileRepository.findById(idMember);
        if (staffOpt.isPresent() && managerOpt.isPresent()) {
            // Log warning instead of throwing exception
            System.err.println("Duplicate profile found for ID: " + idMember + ". Preferring Manager Profile.");
            return managerOpt.get().getDealerId();
        }

        if (staffOpt.isEmpty() && managerOpt.isEmpty()) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        return staffOpt.map(DealerStaffProfile::getDealerId)
                .orElseGet(() -> managerOpt.get().getDealerId());
    }

}
