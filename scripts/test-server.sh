#!/bin/bash

# Test script for Spline MCP Server

echo "Spline MCP Server Test Script"
echo "============================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js to continue."
    exit 1
fi

echo "✅ Node.js is installed"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed. Running npm install..."
    npm install
fi

echo "✅ Dependencies are installed"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    cp .env.example .env
    echo "Please edit .env file with your API keys"
fi

echo "✅ Configuration file exists"

# Test that the server can start
echo -e "\nTesting server startup..."
timeout 5s node src/index.js > /dev/null 2>&1
if [ $? -eq 124 ]; then
    echo "✅ Server started successfully (terminated after 5 seconds)"
else
    echo "❌ Server failed to start"
    node src/index.js
fi

echo -e "\nServer test complete!"
echo "To run with MCP Inspector, use the inspector-config.json file"
