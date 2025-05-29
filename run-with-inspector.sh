#!/bin/bash

# This script runs the Spline MCP server with the MCP Inspector

echo "Starting Spline MCP Server with MCP Inspector..."
echo "================================================"

# Check if the server dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing server dependencies..."
    npm install
fi

# Check if MCP Inspector is installed globally
if ! command -v mcp-inspector &> /dev/null; then
    echo "Installing MCP Inspector globally..."
    npm install -g @modelcontextprotocol/inspector
fi

# Run the MCP Inspector with our server
echo "Starting MCP Inspector with Spline MCP server..."
echo "Open http://localhost:6274 in your browser once the server starts"

# Run the inspector
npx -y @modelcontextprotocol/inspector@latest node src/index.js
