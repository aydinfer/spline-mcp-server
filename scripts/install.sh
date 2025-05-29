#!/bin/bash

# Spline.design MCP Server Installation Script

echo "Installing Spline.design MCP Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js before continuing."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm before continuing."
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please edit the .env file to add your API keys."
else
    echo ".env file already exists. Skipping creation."
fi

echo "Installation complete!"
echo "To start the server, run: npm start"
echo "For usage instructions, see USAGE_GUIDE.md"
