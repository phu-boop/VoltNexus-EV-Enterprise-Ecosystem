#!/bin/bash

# Configuration
DOCKER_USERNAME="anhphu4784"
ROOT_DIR="/home/devphu/Documents/complete-project/VoltNexus-EV-Enterprise-Ecosystem-clean/VoltNexus-EV-Enterprise-Ecosystem"

cd "$ROOT_DIR" || exit

# # 1. Gateway (at root level)
# echo "----------------------------------------------------"
# echo "Building & Pushing: gateway"
# echo "----------------------------------------------------"
# docker build --no-cache -f gateway/Dockerfile -t "$DOCKER_USERNAME/gateway:latest" .
# docker push "$DOCKER_USERNAME/gateway:latest"

# 2. Services inside services/ directory
services=("ai-service")

for service in "${services[@]}"; do
    echo "----------------------------------------------------"
    echo "Building & Pushing: $service (NO CACHE)"
    echo "----------------------------------------------------"
    
    docker build --no-cache -f "services/$service/Dockerfile" -t "$DOCKER_USERNAME/$service:latest" .
    docker push "$DOCKER_USERNAME/$service:latest"
done

# # 3. Frontend Apps
# echo "----------------------------------------------------"
# echo "Building & Pushing: frontend-my-app"
# echo "----------------------------------------------------"
# docker build --no-cache -t "$DOCKER_USERNAME/frontend-my-app:latest" ./frontend/my-app
# docker push "$DOCKER_USERNAME/frontend-my-app:latest"

# echo "----------------------------------------------------"
# echo "Building & Pushing: customer-app"
# echo "----------------------------------------------------"
# docker build --no-cache -t "$DOCKER_USERNAME/customer-app:latest" ./frontend/customer-app
# docker push "$DOCKER_USERNAME/customer-app:latest"

echo "----------------------------------------------------"
echo "ALL BUILDS AND PUSHES COMPLETED!"
echo "----------------------------------------------------"