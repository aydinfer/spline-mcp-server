#!/bin/bash

# Setup script for Spline MCP Server

echo "========================================"
echo "Setting up Spline MCP Server"
echo "========================================"

# Install dependencies
echo "Installing dependencies..."
npm install

# Create a simple .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Spline API Keys and Configuration
SPLINE_API_KEY=your_spline_api_key_here
SPLINE_PROJECT_ID=your_project_id_here

# OpenAI API Key (for AI text integration)
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3001
EOF
    echo "Created .env file. Please update it with your actual API keys."
else
    echo ".env file already exists, skipping creation."
fi

echo ""
echo "Setup complete! You can now run the server with:"
echo "npm start"
echo ""
echo "To use the MCP server with Claude, you'll need to:"
echo "1. Start the server with 'npm start'"
echo "2. Connect Claude to the server using an MCP client"
echo "3. Provide your Spline scene ID to start creating objects"
echo "========================================"
