package com.ev.common_lib.constant;

/**
 * Constants for custom Gateway headers shared across services.
 */
public final class HeaderConstants {
    private HeaderConstants() {
        // Private constructor to prevent instantiation
    }

    public static final String X_USER_EMAIL = "X-User-Email";
    public static final String X_USER_ROLE = "X-User-Role";
    public static final String X_USER_ID = "X-User-Id";
    public static final String X_USER_PROFILE_ID = "X-User-ProfileId";
    public static final String X_USER_DEALER_ID = "X-User-DealerId";
}
