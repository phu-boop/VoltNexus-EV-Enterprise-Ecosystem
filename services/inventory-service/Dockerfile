# -------- Stage 1: Build common-lib ----------
FROM maven:3.9.9-eclipse-temurin-21 AS common-lib
WORKDIR /build/common-lib

# Copy common-lib từ root context
COPY common-lib/pom.xml ./pom.xml
COPY common-lib/src ./src

# Build và cài đặt vào local Maven repo
RUN mvn clean install -DskipTests


# -------- Stage 2: Build ứng dụng ----------
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app/inventory-service

# Copy file pom.xml và source code của inventory-service
COPY services/inventory-service/pom.xml .
COPY services/inventory-service/src ./src

# Copy Maven repo từ common-lib stage
COPY --from=common-lib /root/.m2 /root/.m2

# Build ứng dụng (tạo file jar)
RUN mvn clean package -DskipTests


# -------- Stage 3: Chạy ứng dụng ----------
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app/inventory-service

# Copy file JAR từ stage build
COPY --from=build /app/inventory-service/target/*.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]
