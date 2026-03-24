#!/bin/bash
set -e

echo "==============================================="
echo "Installing Newman and HTMLExtra Reporter"
echo "==============================================="
npm install -g newman newman-reporter-htmlextra

COLLECTIONS=(
  "Auth_API_Postman_Collection.json"
  "User_Service_Collection.json"
  "Vehicle_Service_Collection.json"
  "Dealer_Service_Collection.json"
  "Customer_Service_Collection.json"
  "Inventory_Service_Collection.json"
  "Sales_Service_Collection.json"
  "Payment_Service_Collection.json"
  "AI_Service_Collection.json"
  "Reporting_Service_Collection.json"
)

ENV_FILE="VoltNexus_Environment.postman_environment.json"

mkdir -p newman-reports

for COLL in "${COLLECTIONS[@]}"; do
  echo "------------------------------------------------"
  echo "Running Testing for: $COLL"
  echo "------------------------------------------------"
  newman run "$COLL" -e "$ENV_FILE" \
    -r cli,htmlextra \
    --reporter-htmlextra-export "newman-reports/${COLL%.json}_Report.html" \
    --bail false
done

echo "==============================================="
echo "All Postman API Tests Finished."
echo "Reports generated in newman-reports/ directory."
echo "==============================================="
