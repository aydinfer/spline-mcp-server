#!/bin/bash

# Script to test the running Spline MCP Server with MCP Inspector

echo "Setting up MCP Inspector for your running Spline.design MCP server..."
echo "=============================================================="

# Check if the inspector is installed
if [ ! -d "../inspector" ]; then
    echo "Error: MCP Inspector not found at ../inspector"
    echo "Please clone it from https://github.com/modelcontextprotocol/inspector"
    exit 1
fi

# Create a configuration for the running server
cat > mcp-inspector-running-config.json << EOF
{
  "mcpServers": {
    "spline-mcp": {
      "type": "stdio",
      "command": "node",
      "args": [
        "$(pwd)/src/index.js"
      ]
    }
  }
}
EOF

echo "Configuration created for running server"
echo ""
echo "IMPORTANT INSTRUCTIONS:"
echo "1. Make sure your Spline MCP Server is running in one terminal with:"
echo "   npm start"
echo ""
echo "2. In a DIFFERENT terminal, start the inspector with:"
echo "   cd ../inspector"
echo "   npm run dev -- --mcp-config ../spline-mcp-server/mcp-inspector-running-config.json"
echo ""
echo "3. Navigate to http://localhost:5173 once the inspector starts"
echo ""
echo "Configuration file saved to: $(pwd)/mcp-inspector-running-config.json"
