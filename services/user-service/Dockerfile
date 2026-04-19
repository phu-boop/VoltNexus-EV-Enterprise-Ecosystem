# -------- Stage 1: build common-lib ----------
FROM maven:3.9.9-eclipse-temurin-21 AS common-lib
WORKDIR /build/common-lib

# Copy common-lib
COPY common-lib/pom.xml ./pom.xml
COPY common-lib/src ./src

RUN mvn clean install -DskipTests

# -------- Stage 2: build user-service ----------
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /app/user-service

# Copy source user-service
COPY services/user-service/pom.xml .
COPY services/user-service/src ./src

# Copy common-lib jar
COPY --from=common-lib /root/.m2/repository/com/ev/common-lib/0.0.1-SNAPSHOT/*.jar /root/.m2/repository/com/ev/common-lib/0.0.1-SNAPSHOT/

# Build user-service
RUN mvn clean package -DskipTests

# -------- Stage 3: run user-service ----------
FROM eclipse-temurin:21.0.4_7-jdk-alpine
WORKDIR /app/user-service

# Copy jar đã build
COPY --from=builder /app/user-service/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
