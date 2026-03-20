package com.ev.payment_service.config;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPrincipal implements Serializable {

    private String email;
    private String role; // "ADMIN", "DEALER_STAFF"
    private UUID profileId; // profileId của (Admin, EVMStaff, DealerStaff, DealerManager)
    private UUID dealerId; // (Sẽ dùng sau)

    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + this.role));
    }
}