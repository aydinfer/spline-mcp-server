#!/bin/bash

# Run the Spline Webhook Server
echo "Starting Spline Webhook Server..."
echo "================================="

# Load environment variables if .env exists
if [ -f .env ]; then
    echo "Loading environment from .env file..."
    export $(cat .env | xargs)
fi

# Start the server
node super-simple-server.js
