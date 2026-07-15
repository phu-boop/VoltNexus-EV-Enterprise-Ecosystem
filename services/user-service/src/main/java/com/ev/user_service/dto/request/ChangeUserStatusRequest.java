package com.ev.user_service.dto.request;

import com.ev.user_service.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeUserStatusRequest {
    @NotNull(message = "Status is required")
    private UserStatus status;
}
