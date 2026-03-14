package com.ev.user_service.dto.request;

import java.util.UUID;

public class ProfileRequest {
    private UUID id_user;

    public UUID getId_user() {
        return id_user;
    }

    public void setId_user(UUID id_user) {
        this.id_user = id_user;
    }
}
