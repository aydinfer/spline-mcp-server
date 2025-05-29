#!/bin/bash

# Run the Enhanced Spline Webhook Server
echo "Starting Enhanced Spline Webhook Server..."
echo "=========================================="

# Load environment variables if .env exists
if [ -f .env ]; then
    echo "Loading environment from .env file..."
    export $(cat .env | xargs)
fi

# Start the server
node enhanced-webhook-server.js
