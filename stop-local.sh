#!/bin/bash

# VoltNexus EV Enterprise Ecosystem - Shutdown Script
# This script stops all background services.

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${RED}======================================================================${NC}"
echo -e "${RED}   VoltNexus EV Enterprise Ecosystem - Shutdown Script                ${NC}"
echo -e "${RED}======================================================================${NC}"

# 1. Stop Backend Services (Maven/Spring Boot)
echo -e "${YELLOW}Stopping Backend Services (Spring Boot)...${NC}"
# Find PIDs for mvn spring-boot:run and kill them
pkill -f "spring-boot:run"
pkill -f "user-service"
pkill -f "customer-service"
pkill -f "dealer-service"
pkill -f "inventory-service"
pkill -f "payment-service"
pkill -f "sales-service"
pkill -f "vehicle-service"
pkill -f "reporting-service"
pkill -f "ai-service"
pkill -f "gateway"

# 2. Stop Frontend Applications (Node/Vite)
echo -e "\n${YELLOW}Stopping Frontend Applications (Node/Vite)...${NC}"
pkill -f "vite"
pkill -f "npm run dev"

# 3. Optional: Stop Docker Infrastructure
echo -e "\n${YELLOW}Do you want to stop Docker infrastructure (Kafka, Redis)? [y/N]${NC}"
read -t 5 -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Stopping Docker containers...${NC}"
    docker-compose down
else
    echo -e "${BLUE}Keeping Docker infrastructure running.${NC}"
fi

echo -e "\n${GREEN}All local background processes have been stopped.${NC}"
echo -e "${GREEN}======================================================================${NC}"
