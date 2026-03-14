# -------- Stage 1: Build common-lib ----------
FROM maven:3.9.9-eclipse-temurin-21 AS common-lib
WORKDIR /build/common-lib

# Copy common-lib từ root context
COPY common-lib/pom.xml ./pom.xml
COPY common-lib/src ./src

# Build và cài đặt vào local Maven repo
RUN mvn clean install -DskipTests


# -------- Stage 2: Build ai-service ----------
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy file pom.xml và source code của ai-service
COPY services/ai-service/pom.xml .
COPY services/ai-service/src ./src

# Copy toàn bộ source code để Maven có thể resolve các module khác
COPY . .

# Copy Maven repo từ stage common-lib
COPY --from=common-lib /root/.m2 /root/.m2

# Build ứng dụng (tạo file jar)
RUN mvn clean package -DskipTests


# -------- Stage 3: Chạy ứng dụng ----------
# Use Debian-based image instead of Alpine for glibc compatibility (required by DJL/tokenizers)
FROM eclipse-temurin:21-jdk

WORKDIR /app

# Copy file JAR từ stage build
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8089

ENTRYPOINT ["java", "-jar", "app.jar"]

