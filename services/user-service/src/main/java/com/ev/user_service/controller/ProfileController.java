package com.ev.user_service.controller;


import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.user_service.dto.respond.ApiResponseStaffDealer;
import com.ev.user_service.service.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/users/profile")
public class ProfileController {
    private final ProfileService profileService;

    public  ProfileController(ProfileService profileService){
        this.profileService = profileService;
    }
    @GetMapping("/{dealerId}")
    public ResponseEntity<ApiRespond<List<ApiResponseStaffDealer>>> getStaffDealerByIdDealer(@PathVariable UUID dealerId) {
        List<ApiResponseStaffDealer> apiResponseStaffDealers = profileService.getStaffDealerByIdDealer(dealerId);
        return ResponseEntity.ok(ApiRespond.success("Get all staffDealer by idDealer successfully",apiResponseStaffDealers));
    }

    @PostMapping("/idDealer")
    public ResponseEntity<ApiRespond<UUID>> getIdDealerByIdMember(@RequestBody Map<String, String> body) {
        String raw = body.get("userId");
        if (raw == null || raw.isBlank()) {
            raw = body.get("idMember");
        }
        if (raw == null || raw.isBlank()) {
            raw = body.get("idDealer");
        }
        if (raw == null || raw.isBlank()) {
            throw new AppException(ErrorCode.MISSING_REQUIRED_FIELD);
        }
        UUID idMember = UUID.fromString(raw);
        return ResponseEntity.ok(ApiRespond.success(
            "get id dealer successfully",
            profileService.getIdDealerByIdMember(idMember)
        ));
    }

}
