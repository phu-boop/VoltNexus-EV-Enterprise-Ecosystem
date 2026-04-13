#!/bin/bash

# Configuration
NAMESPACE="voltnexus"
CONFIG_DIR="config"

# List of services and their expected secret names
# Format: "service_name:secret_name"
SERVICES=(
    "gateway:gateway-secret"
    "user-service:user-service-secret"
    "customer-service:customer-service-secret"
    "dealer-service:dealer-service-secret"
    "inventory-service:inventory-service-secret"
    "payment-service:payment-service-secret"
    "sales-service:sales-service-secret"
    "vehicle-service:vehicle-service-secret"
    "reporting-service:reporting-service-secret"
    "ai-service:ai-service-secret"
)

echo "--- 🚀 Starting K8s Secret Deployment for VoltNexus ---"

# Ensure namespace exists
kubectl get namespace $NAMESPACE >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Creating namespace $NAMESPACE..."
    kubectl create namespace $NAMESPACE
else
    echo "Namespace $NAMESPACE already exists."
fi

# Iterate through services
for entry in "${SERVICES[@]}"; do
    SERVICE="${entry%%:*}"
    SECRET="${entry#*:}"
    ENV_FILE="$CONFIG_DIR/$SERVICE.env"

    echo "--------------------------------------------------------"
    if [ -f "$ENV_FILE" ]; then
        echo "Processing $SERVICE -> $SECRET..."
        
        # Delete existing secret to avoid conflicts (force update)
        kubectl delete secret "$SECRET" -n "$NAMESPACE" --ignore-not-found=true
        
        # Create new secret from env-file
        kubectl create secret generic "$SECRET" \
            --from-env-file="$ENV_FILE" \
            -n "$NAMESPACE"
            
        if [ $? -eq 0 ]; then
            echo "✅ Successfully created secret: $SECRET"
        else
            echo "❌ Failed to create secret: $SECRET"
        fi
    else
        echo "⚠️ Warning: File $ENV_FILE not found! Skipping $SECRET."
    fi
done

echo "--------------------------------------------------------"
echo "--- 🎉 Done! All secrets processed. ---"
kubectl get secrets -n $NAMESPACE
