package com.ev.user_service.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FirebaseConfigTest {

    @Mock
    private Resource firebaseKey;

    @InjectMocks
    private FirebaseConfig firebaseConfig;

    @Test
    void initFirebase_ShouldNotThrowException_WhenConfigIsMissing() {
        // Since we are running in a CI/CD-like environment where the real
        // firebase-service-account.json might not exist,
        // the method should gracefully handle the missing file by just printing a
        // warning and returning.

        when(firebaseKey.exists()).thenReturn(false);
        when(firebaseKey.getDescription()).thenReturn("class path resource [mock-firebase.json]");

        assertDoesNotThrow(() -> firebaseConfig.initFirebase());
    }
}
