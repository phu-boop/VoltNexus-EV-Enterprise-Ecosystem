# Sử dụng JDK 17 (vì trong pom bạn khai java.version=17)
FROM eclipse-temurin:17-jdk-alpine AS builder

# Thư mục làm việc trong container
WORKDIR /app

# Copy toàn bộ source code
COPY . .

# Build ứng dụng Spring Boot (tạo file jar trong target/)
RUN ./mvnw clean package -DskipTests

# --------- Stage chạy thực tế -----------
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy file jar từ stage builder
COPY --from=builder /app/target/*.jar app.jar

# Expose port (tùy service)
EXPOSE 8080

# Lệnh chạy ứng dụng
ENTRYPOINT ["java","-jar","app.jar"]
