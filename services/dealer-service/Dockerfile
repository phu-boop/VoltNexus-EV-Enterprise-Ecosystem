# -------- Stage 1: Build common-lib ----------
FROM maven:3.9.9-eclipse-temurin-21 AS common-lib
WORKDIR /build/common-lib

# Copy common-lib từ root context
COPY common-lib/pom.xml ./pom.xml
COPY common-lib/src ./src

# Build và cài vào local Maven repo
RUN mvn clean install -DskipTests


# -------- Stage 2: Build ứng dụng ----------
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy file pom.xml và source code của dealer-service
COPY services/dealer-service/pom.xml .
COPY services/dealer-service/src ./src

# Copy toàn bộ source code để lấy cấu trúc dependency đầy đủ
COPY . .

# Copy local Maven repo từ common-lib stage
COPY --from=common-lib /root/.m2 /root/.m2

# Build ứng dụng (tạo file jar)
RUN mvn clean package -DskipTests


# -------- Stage 3: Chạy ứng dụng ----------
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# Copy file JAR từ stage build
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8083

ENTRYPOINT ["java", "-jar", "app.jar"]

