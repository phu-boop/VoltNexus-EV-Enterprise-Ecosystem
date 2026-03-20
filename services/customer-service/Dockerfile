# -------- Stage 1: Build common-lib ----------
FROM maven:3.9.9-eclipse-temurin-21 AS common-lib
WORKDIR /build/common-lib

# Copy common-lib từ root context (nằm cùng cấp với services/)
COPY common-lib/pom.xml ./pom.xml
COPY common-lib/src ./src

# Cài đặt vào local repo Maven
RUN mvn clean install -DskipTests


# -------- Stage 2: Build ứng dụng ----------
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy file pom.xml và source code của service
COPY services/customer-service/pom.xml .
COPY services/customer-service/src ./src

# Copy toàn bộ source code (để lấy cấu trúc đầy đủ)
COPY . .

# Copy local Maven repo từ common-lib (đã có lib cài đặt sẵn)
COPY --from=common-lib /root/.m2 /root/.m2

# Build ứng dụng
RUN mvn clean package -DskipTests


# -------- Stage 3: Chạy ứng dụng ----------
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# Copy file JAR từ stage build
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]




