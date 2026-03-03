#!/bin/bash

# VoltNexus EV Enterprise Ecosystem - Startup Script
# This script runs all services locally in the background.

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}   VoltNexus EV Enterprise Ecosystem - Local Startup Script           ${NC}"
echo -e "${BLUE}======================================================================${NC}"

# Check for required tools
echo -e "${YELLOW}Checking requirements...${NC}"
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}docker-compose is required but not installed. Aborting.${NC}" >&2; exit 1; }
command -v mvn >/dev/null 2>&1 || { echo -e "${RED}maven is required but not installed. Aborting.${NC}" >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}node is required but not installed. Aborting.${NC}" >&2; exit 1; }

# Create logs directory
mkdir -p logs

# # 1. Start Infrastructure
# echo -e "\n${YELLOW}[1/4] Starting infrastructure (Zookeeper, Kafka, Redis) in Docker...${NC}"
# docker-compose up -d zookeeper kafka redis-db redisinsight
# if [ $? -ne 0 ]; then
#     echo -e "${RED}Failed to start infrastructure containers.${NC}"
#     exit 1
# fi

# 2. Build common-lib
echo -e "\n${YELLOW}[2/4] Building common-lib...${NC}"
cd common-lib && mvn clean install -DskipTests
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to build common-lib.${NC}"
    exit 1
fi
cd ..

# 3. Start Backend Services
echo -e "\n${YELLOW}[3/4] Starting backend microservices background (Logs: logs/*.log)...${NC}"

services=(
    "gateway:8080"
    "services/user-service:8081"
    "services/customer-service:8082"
    "services/dealer-service:8083"
    "services/inventory-service:8084"
    "services/payment-service:8085"
    "services/sales-service:8086"
    "services/vehicle-service:8087"
    "services/reporting-service:8088"
    "services/ai-service:8500"
)

for service_info in "${services[@]}"; do
    path="${service_info%%:*}"
    port="${service_info##*:}"
    name=$(basename "$path")
    
    echo -e "   -> Starting ${GREEN}$name${NC} on port ${BLUE}$port${NC}"
    nohup mvn -f "$path/pom.xml" spring-boot:run > "logs/$name.log" 2>&1 &
done

# 4. Start Frontends
echo -e "\n${YELLOW}[4/4] Starting frontend applications...${NC}"

# Admin & Dealer Portal
echo -e "   -> Starting ${GREEN}my-app${NC} (Port 5173)"
cd frontend/my-app
if [ ! -d "node_modules" ]; then
    echo "      (First run: installing dependencies...)"
    npm install --silent
fi
nohup npm run dev > ../../logs/frontend-my-app.log 2>&1 &
cd ../..

# Customer Portal
echo -e "   -> Starting ${GREEN}customer-app${NC} (Port 5174)"
cd frontend/customer-app
if [ ! -d "node_modules" ]; then
    echo "      (First run: installing dependencies...)"
    npm install --silent
fi
nohup npm run dev > ../../logs/frontend-customer-app.log 2>&1 &
cd ../..

echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN}   Ecosystem started successfully!${NC}"
echo -e "   - Check logs in the ${BLUE}./logs${NC} directory."
echo -e "   - Gateway: ${BLUE}http://localhost:8080${NC}"
echo -e "   - Admin Portal: ${BLUE}http://localhost:5173${NC}"
echo -e "   - Customer Portal: ${BLUE}http://localhost:5174${NC}"
echo -e "   - RedisInsight: ${BLUE}http://localhost:5540${NC}"
echo -e "${GREEN}======================================================================${NC}"
echo -e "Run ${YELLOW}./stop-local.sh${NC} to stop all services."
