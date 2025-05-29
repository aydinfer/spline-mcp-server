#!/bin/bash

# Script to test Spline MCP Server with MCP Inspector

echo "Starting MCP Inspector for Spline.design MCP Server..."
echo "=================================================="

# Check if the inspector is installed
if [ ! -d "../inspector" ]; then
    echo "Error: MCP Inspector not found at ../inspector"
    echo "Please clone it from https://github.com/modelcontextprotocol/inspector"
    exit 1
fi

# Check if server dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing server dependencies..."
    npm install
fi

# Set up environment variables
if [ -f .env ]; then
    echo "Loading environment variables from .env..."
    export $(cat .env | xargs)
else
    echo "Warning: .env file not found. Using example values..."
    cp .env.example .env
    echo "Please edit .env with your actual API keys"
fi

# Update the config file with current path
cat > mcp-inspector-config.json << EOF
{
  "mcpServers": {
    "spline-mcp": {
      "command": "node",
      "args": [
        "$(pwd)/src/index.js"
      ],
      "env": {
        "SPLINE_API_KEY": "${SPLINE_API_KEY:-your_spline_api_key_here}",
        "OPENAI_API_KEY": "${OPENAI_API_KEY:-your_openai_api_key_here}"
      }
    }
  }
}
EOF

echo "Configuration updated with current path: $(pwd)"
echo ""
echo "Starting MCP Inspector..."
echo "Navigate to http://localhost:5173 once the server starts"
echo ""

# Start the inspector
cd ../inspector
npm run dev -- --mcp-config ../spline-mcp-server/mcp-inspector-config.json
