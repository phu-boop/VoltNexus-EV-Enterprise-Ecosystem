package com.ev.user_service.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@ExtendWith(MockitoExtension.class)
class FirebaseConfigTest {

    @InjectMocks
    private FirebaseConfig firebaseConfig;

    @Test
    void initFirebase_ShouldNotThrowException_WhenConfigIsMissing() {
        // Since we are running in a CI/CD-like environment where the real
        // firebase-service-account.json might not exist,
        // the method should gracefully handle the missing file by just printing a
        // warning and returning.

        assertDoesNotThrow(() -> firebaseConfig.initFirebase());
    }
}
