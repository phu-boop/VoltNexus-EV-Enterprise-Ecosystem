package com.ev.common_lib.constant;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;

import static org.junit.jupiter.api.Assertions.*;

class HeaderConstantsTest {

    @Test
    void testConstructorIsPrivate() throws Exception {
        Constructor<HeaderConstants> constructor = HeaderConstants.class.getDeclaredConstructor();
        assertTrue(java.lang.reflect.Modifier.isPrivate(constructor.getModifiers()));
        constructor.setAccessible(true);
        Object instance = constructor.newInstance();
        assertNotNull(instance);
    }

    @Test
    void testConstants() {
        assertEquals("X-User-Email", HeaderConstants.X_USER_EMAIL);
        assertEquals("X-User-Role", HeaderConstants.X_USER_ROLE);
        assertEquals("X-User-Id", HeaderConstants.X_USER_ID);
        assertEquals("X-User-ProfileId", HeaderConstants.X_USER_PROFILE_ID);
        assertEquals("X-User-DealerId", HeaderConstants.X_USER_DEALER_ID);
    }
}
