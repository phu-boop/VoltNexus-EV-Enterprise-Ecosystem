#!/bin/bash

# VoltNexus Local Deployment Script
# This script automates the deployment of the ecosystem on Minikube.

set -e

NAMESPACE="voltnexus"

echo "🚀 Starting VoltNexus Local Deployment..."


# 2. Set Docker Environment
echo "📦 Setting Docker environment to Minikube..."
eval $(minikube docker-env)

# 3. Build Docker Images
echo "🏗️ Building Docker images (this may take a few minutes)..."
docker build -t my-gateway:latest -f gateway/Dockerfile .
docker build -t my-user-service:latest -f services/user-service/Dockerfile .
docker build -t my-vehicle-service:latest -f services/vehicle-service/Dockerfile .

# 4. Prepare Kubernetes Namespace & Config
echo "⚙️ Applying Namespace and ConfigMap..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml

# 5. Initialize Secrets (Dummy secrets for local run)
echo "🔐 Initializing local secrets..."
create_secret_if_missing() {
    local name=$1
    if ! kubectl get secret "$name" -n $NAMESPACE > /dev/null 2>&1; then
        echo "Creating secret: $name"
        kubectl create secret generic "$name" --from-literal=LOCAL_DEV=true -n $NAMESPACE
    else
        echo "Secret $name already exists, skipping."
    fi
}

services=("gateway" "user-service" "customer-service" "dealer-service" "inventory-service" "payment-service" "sales-service" "vehicle-service" "reporting-service" "ai-service")
for svc in "${services[@]}"; do
    create_secret_if_missing "${svc}-secret"
done

# 6. Deploy Infrastructure (Kafka, Redis, etc.)
echo "🏗️ Deploying Infrastructure..."
kubectl apply -f k8s/infrastructure/

# 7. Deploy Backend Services
echo "🚀 Deploying Backend Services..."
kubectl apply -f k8s/services/

echo "⏳ Waiting for services to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/gateway -n $NAMESPACE || true

echo "--------------------------------------------------------"
echo "✅ Deployment Complete!"
echo "--------------------------------------------------------"
echo "🌐 To access the system, run this in a separate terminal:"
echo "   kubectl port-forward svc/gateway 8080:8080 -n $NAMESPACE"
echo ""
echo "📊 Then visit: http://localhost:8080/actuator/health"
echo "--------------------------------------------------------"
