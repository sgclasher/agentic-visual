#!/bin/bash

# Agentic AI Architecture Data Fetcher
# 
# This script provides a simple way to fetch Agentic AI architecture data
# from ServiceNow and save it to workflow-data.json
#
# Usage: ./fetch-agentic-data.sh [instance] [username] [password] [scope]

# Default values (change these or override with arguments)
DEFAULT_INSTANCE="https://nowgenticllcdemo1.service-now.com"
DEFAULT_USERNAME="integrationUser"
DEFAULT_PASSWORD="J5)F{b!L]3hPkrU]V_j:c[({h4QV@iQn7Ob!@o+rne0A<VV+*U.z^[r)e&@mO.o7}E1{xJSyAfDhd:A&?*LUa4TCYl;QZXNF@]_a"
DEFAULT_SCOPE="x_nowge_rfx_ai"

# Use arguments if provided, otherwise use defaults
INSTANCE=${1:-$DEFAULT_INSTANCE}
USERNAME=${2:-$DEFAULT_USERNAME}
PASSWORD=${3:-$DEFAULT_PASSWORD}
SCOPE=${4:-$DEFAULT_SCOPE}

# Check if the application is running
if ! curl -s http://localhost:3000 > /dev/null; then
  echo "Error: Application doesn't seem to be running on http://localhost:3000"
  echo "Please start the application with 'npm run dev' before running this script."
  exit 1
fi

echo "Fetching Agentic AI data from ServiceNow..."
echo "Instance: $INSTANCE"
echo "Scope: $SCOPE"

# Run the Node.js script
node scripts/fetch-agentic-ai-data.js "$INSTANCE" "$USERNAME" "$PASSWORD" "$SCOPE"

# Check if the script executed successfully
if [ $? -eq 0 ]; then
  echo ""
  echo "Success! The data has been saved to public/workflow-data.json"
  echo "Refresh your browser to see the updated visualization."
fi 