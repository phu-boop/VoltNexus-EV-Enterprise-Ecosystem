# -------- Stage 1: Build common-lib ----------
FROM maven:3.9.9-eclipse-temurin-21 AS common-lib
WORKDIR /build/common-lib

# Copy common-lib từ root context
COPY common-lib/pom.xml ./pom.xml
COPY common-lib/src ./src

# Cài đặt vào local Maven repo (để service có thể sử dụng)
RUN mvn clean install -DskipTests


# -------- Stage 2: Build vehicle-service ----------
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy file pom.xml và source code của vehicle-service
COPY services/vehicle-service/pom.xml .
COPY services/vehicle-service/src ./src

# Copy toàn bộ project để Maven có thể resolve dependency giữa các module
COPY . .

# Copy Maven repo từ common-lib
COPY --from=common-lib /root/.m2 /root/.m2

# Build ứng dụng (tạo file JAR)
RUN mvn clean package -DskipTests


# -------- Stage 3: Chạy ứng dụng ----------
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# Copy file JAR từ stage build
COPY --from=build /app/target/*.jar app.jar

# Mở port 8087 cho service
EXPOSE 8087

ENTRYPOINT ["java", "-jar", "app.jar"]
