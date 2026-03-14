package com.ev.vehicle_service.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImageService {

    private final Cloudinary cloudinary;

    /**
     * Upload image to Cloudinary
     * 
     * @param file   MultipartFile to upload
     * @param folder Folder path in Cloudinary (e.g., "vehicles/models",
     *               "vehicles/variants")
     * @return Cloudinary URL of uploaded image
     */
    public String uploadImage(MultipartFile file, String folder) {
        try {
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image",
                    "overwrite", true,
                    "transformation", new Object[] {
                            ObjectUtils.asMap("quality", "auto"),
                            ObjectUtils.asMap("fetch_format", "auto")
                    });

            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            String imageUrl = (String) uploadResult.get("secure_url");
            log.info("Image uploaded successfully to Cloudinary: {}", imageUrl);
            return imageUrl;
        } catch (IOException e) {
            log.error("Error uploading image to Cloudinary", e);
            throw new RuntimeException("Failed to upload image: " + e.getMessage());
        }
    }

    /**
     * Delete image from Cloudinary
     * 
     * @param imageUrl Full URL of the image to delete
     */
    public void deleteImage(String imageUrl) {
        try {
            // Extract public_id from URL
            String publicId = extractPublicId(imageUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                log.info("Image deleted successfully from Cloudinary: {}", publicId);
            }
        } catch (Exception e) {
            log.error("Error deleting image from Cloudinary", e);
        }
    }

    /**
     * Extract public_id from Cloudinary URL
     */
    private String extractPublicId(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("cloudinary.com")) {
            return null;
        }
        try {
            // Cắt bỏ phần domain gốc để lấy path
            // Ví dụ: https://.../upload/v12345/folder/image.jpg
            // -> v12345/folder/image.jpg
            int uploadIndex = imageUrl.indexOf("/upload/");
            if (uploadIndex == -1)
                return null;

            String path = imageUrl.substring(uploadIndex + 8); // Bỏ qua "/upload/"

            // Dùng Regex để xóa phần version (v + số + /) nếu có
            // v12345/folder/image.jpg -> folder/image.jpg
            if (path.matches("^v\\d+/.*")) {
                path = path.replaceFirst("^v\\d+/", "");
            }

            // Xóa đuôi file mở rộng (.jpg, .png...)
            int lastDot = path.lastIndexOf(".");
            if (lastDot > 0) {
                path = path.substring(0, lastDot);
            }

            return path;
        } catch (Exception e) {
            log.error("Error extracting public_id from URL: {}", imageUrl, e);
        }
        return null;
    }
}
