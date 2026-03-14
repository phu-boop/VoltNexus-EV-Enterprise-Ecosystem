package com.ev.vehicle_service.controller;

import com.ev.common_lib.dto.respond.ApiRespond;
import com.ev.common_lib.exception.ErrorCode;
import com.ev.vehicle_service.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/vehicle-catalog/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    /**
     * Upload image for vehicle model
     */
    @PostMapping("/models")
    public ResponseEntity<ApiRespond<String>> uploadModelImage(
            @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = imageService.uploadImage(file, "vehicles/models");
            return ResponseEntity.ok(ApiRespond.success("Image uploaded successfully", imageUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiRespond.error(ErrorCode.INTERNAL_ERROR.getCode(),
                            "Failed to upload image: " + e.getMessage(), null));
        }
    }

    /**
     * Upload image for vehicle variant
     */
    @PostMapping("/variants")
    public ResponseEntity<ApiRespond<String>> uploadVariantImage(
            @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = imageService.uploadImage(file, "vehicles/variants");
            return ResponseEntity.ok(ApiRespond.success("Image uploaded successfully", imageUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiRespond.error(ErrorCode.INTERNAL_ERROR.getCode(),
                            "Failed to upload image: " + e.getMessage(), null));
        }
    }

    /**
     * Delete image from Cloudinary
     */
    @DeleteMapping
    public ResponseEntity<ApiRespond<Void>> deleteImage(@RequestParam String imageUrl) {
        try {
            imageService.deleteImage(imageUrl);
            return ResponseEntity.ok(ApiRespond.success("Image deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiRespond.error(ErrorCode.INTERNAL_ERROR.getCode(),
                            "Failed to delete image: " + e.getMessage(), null));
        }
    }
}
