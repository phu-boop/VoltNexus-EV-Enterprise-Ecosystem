package com.ev.vehicle_service.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.cloudinary.utils.ObjectUtils;
import com.ev.common_lib.exception.AppException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ImageServiceTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @InjectMocks
    private ImageService imageService;

    @Mock
    private MultipartFile multipartFile;

    @BeforeEach
    void setUp() {
        lenient().when(cloudinary.uploader()).thenReturn(uploader);
    }

    @Nested
    @DisplayName("uploadImage()")
    class UploadImage {
        @Test
        @DisplayName("Upload thành công -> trả về URL")
        void upload_success() throws IOException {
            byte[] bytes = "test-image".getBytes();
            Map<String, Object> uploadResult = Map.of("secure_url",
                    "https://res.cloudinary.com/test/image/upload/v123/folder/img.jpg");

            when(multipartFile.getBytes()).thenReturn(bytes);
            when(uploader.upload(any(byte[].class), anyMap())).thenReturn(uploadResult);

            String result = imageService.uploadImage(multipartFile, "folder");

            assertThat(result).isEqualTo("https://res.cloudinary.com/test/image/upload/v123/folder/img.jpg");
            verify(uploader).upload(eq(bytes), anyMap());
        }

        @Test
        @DisplayName("Upload lỗi IOException -> ném AppException")
        void upload_ioException_throwsAppException() throws IOException {
            when(multipartFile.getBytes()).thenThrow(new IOException("Read error"));

            assertThatThrownBy(() -> imageService.uploadImage(multipartFile, "folder"))
                    .isInstanceOf(AppException.class);
        }
    }

    @Nested
    @DisplayName("deleteImage()")
    class DeleteImage {
        @Test
        @DisplayName("Xóa thành công")
        void delete_success() throws Exception {
            String url = "https://res.cloudinary.com/test/image/upload/v123/folder/img.jpg";

            imageService.deleteImage(url);

            verify(uploader).destroy(eq("folder/img"), anyMap());
        }

        @Test
        @DisplayName("URL không hợp lệ -> không gọi destroy")
        void delete_invalidUrl_noCall() throws Exception {
            imageService.deleteImage("invalid-url");
            verify(uploader, never()).destroy(anyString(), anyMap());
        }

        @Test
        @DisplayName("Lỗi khi destroy -> catch và log (không ném exception)")
        void delete_exception_caught() throws Exception {
            when(uploader.destroy(anyString(), anyMap())).thenThrow(new RuntimeException("Destroy error"));

            imageService.deleteImage("https://res.cloudinary.com/test/image/upload/v123/img.jpg");

            verify(uploader).destroy(anyString(), anyMap());
        }
    }

    @Nested
    @DisplayName("extractPublicId()")
    class ExtractPublicId {
        @Test
        @DisplayName("Extract thành công nhiều định dạng URL")
        void extract_variousFormats() {
            // Versioned URL
            assertThat((String) ReflectionTestUtils.invokeMethod(imageService, "extractPublicId",
                    "https://res.cloudinary.com/test/image/upload/v12345/folder/sub/img.png"))
                    .isEqualTo("folder/sub/img");

            // No version URL
            assertThat((String) ReflectionTestUtils.invokeMethod(imageService, "extractPublicId",
                    "https://res.cloudinary.com/test/image/upload/folder/img.jpg"))
                    .isEqualTo("folder/img");

            // Minimal URL
            assertThat((String) ReflectionTestUtils.invokeMethod(imageService, "extractPublicId",
                    "https://cloudinary.com/upload/img.jpg"))
                    .isEqualTo("img");

            // Null or invalid
            assertThat((String) ReflectionTestUtils.invokeMethod(imageService, "extractPublicId", (String) null))
                    .isNull();
            assertThat((String) ReflectionTestUtils.invokeMethod(imageService, "extractPublicId", "http://google.com"))
                    .isNull();
        }
    }
}
