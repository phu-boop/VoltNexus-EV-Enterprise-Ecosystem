# ==============================================================================
# NOTE: This Dockerfile MUST be built from the project root directory.
# Example: docker build -f gateway/Dockerfile -t my-gateway .
# ==============================================================================

# Stage 1: Build common-lib
FROM maven:3.9.9-eclipse-temurin-21-alpine AS common-lib-builder
WORKDIR /build/common-lib

# Copy only common-lib source code
COPY common-lib/pom.xml ./
COPY common-lib/src ./src

# Build và install vào local Maven repo của stage này
RUN mvn clean install -DskipTests

# Stage 2: Build gateway-service
FROM maven:3.9.9-eclipse-temurin-21-alpine AS gateway-builder
WORKDIR /app/gateway

# Copy gateway pom first for dependency caching
COPY gateway/pom.xml ./

# Copy common-lib artifacts from Stage 1 to local maven repo
COPY --from=common-lib-builder /root/.m2 /root/.m2

# Now copy gateway source
COPY gateway/src ./src

# Build gateway jar
RUN mvn clean package -DskipTests

# Stage 3: Runtime Image
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app/gateway

# Copy JAR from builder stage
COPY --from=gateway-builder /app/gateway/target/gateway-0.0.1-SNAPSHOT.jar app.jar

# Expose gateway port
EXPOSE 8080

# Use shell form to allow environment variable expansion if needed
# Railway will inject environment variables automatically
ENTRYPOINT ["sh", "-c", "java -jar app.jar --spring.profiles.active=docker"]
