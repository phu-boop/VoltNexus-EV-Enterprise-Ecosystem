package com.ev.vehicle_service.controller;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.vehicle_service.service.ImageService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ImageControllerTest {

    @Mock
    private ImageService imageService;

    @InjectMocks
    private ImageController imageController;

    @Mock
    private MultipartFile multipartFile;

    @Test
    @DisplayName("Upload model image - success")
    void uploadModelImage_success() {
        when(imageService.uploadImage(any(), anyString())).thenReturn("http://image-url");

        ResponseEntity<ApiRespond<String>> response = imageController.uploadModelImage(multipartFile);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getData()).isEqualTo("http://image-url");
    }

    @Test
    @DisplayName("Upload model image - error")
    void uploadModelImage_error() {
        when(imageService.uploadImage(any(), anyString())).thenThrow(new RuntimeException("Upload failed"));

        ResponseEntity<ApiRespond<String>> response = imageController.uploadModelImage(multipartFile);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    @DisplayName("Upload variant image - success")
    void uploadVariantImage_success() {
        when(imageService.uploadImage(any(), anyString())).thenReturn("http://image-url");

        ResponseEntity<ApiRespond<String>> response = imageController.uploadVariantImage(multipartFile);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    @DisplayName("Delete image - success")
    void deleteImage_success() {
        ResponseEntity<ApiRespond<Void>> response = imageController.deleteImage("http://url");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(imageService).deleteImage("http://url");
    }

    @Test
    @DisplayName("Delete image - error")
    void deleteImage_error() {
        doThrow(new RuntimeException("Delete failed")).when(imageService).deleteImage(anyString());

        ResponseEntity<ApiRespond<Void>> response = imageController.deleteImage("http://url");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
