package com.ev.payment_service.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Tải các biến từ file .env vào Spring Environment TRƯỚC KHI
 * application.properties được xử lý.
 * 
 * Ưu tiên load file .env:
 * 1. Từ classpath (resources/.env) - cho development
 * 2. Từ thư mục gốc (./.env) - cho production
 */
public class DotenvApplicationInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        ConfigurableEnvironment environment = applicationContext.getEnvironment();

        Dotenv dotenv = null;
        
        // Thử load từ resources (classpath) trước
        try {
            InputStream inputStream = getClass().getClassLoader().getResourceAsStream(".env");
            if (inputStream != null) {
                // Tạo temp file từ resources để dotenv-java có thể đọc
                File tempFile = File.createTempFile("dotenv", ".env");
                tempFile.deleteOnExit();
                
                try (FileOutputStream outputStream = new FileOutputStream(tempFile)) {
                    byte[] buffer = new byte[1024];
                    int bytesRead;
                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        outputStream.write(buffer, 0, bytesRead);
                    }
                } finally {
                    inputStream.close();
                }
                
                // Load từ temp file
                dotenv = Dotenv.configure()
                        .directory(tempFile.getParent())
                        .filename(tempFile.getName())
                        .ignoreIfMissing()
                        .load();
            }
        } catch (Exception e) {
            // Nếu không load được từ resources, sẽ thử load từ root
        }
        
        // Nếu chưa load được từ resources, thử load từ thư mục gốc
        if (dotenv == null || dotenv.entries().isEmpty()) {
            try {
                dotenv = Dotenv.configure()
                        .directory("./") // Thư mục gốc của project
                        .ignoreIfMissing() // Bỏ qua nếu không thấy file .env
                        .load();
            } catch (Exception e) {
                // Nếu không load được, dotenv sẽ là empty
                dotenv = Dotenv.configure().ignoreIfMissing().load();
            }
        }

        // Lấy tất cả các biến và thêm vào Spring Environment
        if (dotenv != null && !dotenv.entries().isEmpty()) {
            Map<String, Object> envMap = dotenv.entries().stream()
                    .collect(Collectors.toMap(
                            DotenvEntry::getKey,
                            DotenvEntry::getValue
                    ));

            // Thêm vào Spring Environment (ưu tiên cao nhất)
            environment.getPropertySources().addFirst(
                    new MapPropertySource("dotenvProperties", envMap)
            );
        }
    }
}