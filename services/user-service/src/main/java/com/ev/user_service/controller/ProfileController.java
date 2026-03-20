package com.ev.user_service.controller;


import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.user_service.dto.respond.ApiResponseStaffDealer;
import com.ev.user_service.service.ProfileService;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<ApiRespond<UUID>> getIdDealerByIdMember(@RequestBody Map<String, String> body){
        UUID idMember = UUID.fromString(body.get("idDealer")); // lấy từ JSON
        return ResponseEntity.ok(ApiRespond.success(
            "get id dealer successfully",
            profileService.getIdDealerByIdMember(idMember)
        ));
    }

}
