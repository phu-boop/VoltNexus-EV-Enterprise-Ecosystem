package com.ev.user_service.service;

import com.ev.common_lib.exception.AppException;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.user_service.entity.UserDevice;
import com.ev.user_service.enums.Platform;
import com.ev.user_service.repository.UserDeviceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserDeviceService {

    private final UserDeviceRepository userDeviceRepository;

    UserDeviceService(UserDeviceRepository userDeviceRepository){
        this.userDeviceRepository = userDeviceRepository;
    }

    public String saveFCMToken(UUID userId, Map<String, String> body){
        String token = body.get("fcmToken");
        if (token == null || token.isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_ERROR);
        }
        Optional<UserDevice> existing = userDeviceRepository.findByUserIdAndFcmToken(userId, token);
        if (existing.isPresent()) {
            UserDevice device = existing.get();
            device.setUpdatedAt(LocalDateTime.now());
            device.setFcmToken(token);
            userDeviceRepository.save(device);
            return "Token updated";
        } else {
            UserDevice device = UserDevice.builder()
                    .id(UUID.randomUUID())
                    .userId(userId)
                    .fcmToken(token)
                    .platform(Platform.WEB)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            userDeviceRepository.save(device);
        }
        return "Token saved";
    }

    public List<String> getFcmTokensByUserId(UUID userId) {
        List<UserDevice> devices = userDeviceRepository.findByUserId(userId);
        return devices.stream()
                .map(UserDevice::getFcmToken)
                .filter(token -> token != null && !token.isEmpty())
                .collect(Collectors.toList());
    }
}
