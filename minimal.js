import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

// Create a new MCP server
const server = new McpServer({
  name: "Spline.design MCP Server",
  version: "1.0.0",
  description: "Control Spline.design 3D objects, materials, states, and events"
});

// Add a simple test tool
server.tool(
  "hello",
  {},
  async () => ({
    content: [{ 
      type: "text", 
      text: "Hello from Spline.design MCP Server! The server is running correctly."
    }]
  })
);

// Add a simple scene resource
server.resource(
  "test",
  "spline://test",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      text: "This is a test resource. The MCP server is working correctly!"
    }]
  })
);

// Create a stdio transport
const transport = new StdioServerTransport();

// Connect the server to the transport
console.log("Starting Spline.design MCP Server...");
server.connect(transport).then(() => {
  console.log("Server is running and ready to process requests.");
}).catch(error => {
  console.error("Error connecting server:", error);
});
