import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import tool registrations
import { registerObjectTools } from './tools/object-tools.js';
import { registerMaterialTools } from './tools/material-tools.js';
import { registerStateEventTools } from './tools/state-event-tools.js';
import { registerApiWebhookTools } from './tools/api-webhook-tools.js';
import { registerSceneTools } from './tools/scene-tools.js';
import { registerActionTools } from './tools/action-tools.js';
import { registerCompleteEventTools } from './tools/complete-event-tools.js';
import { registerAdvancedMaterialTools } from './tools/advanced-material-tools.js';
import { registerLightingCameraTools } from './tools/lighting-camera-tools.js';
import { registerDesignTools } from './tools/design-tools.js';
import { registerRuntimeTools } from './tools/runtime-tools.js';

// Import resource registrations
import { registerSceneResources } from './resources/scene-resources.js';
import { registerMaterialResources } from './resources/material-resources.js';
import { registerStateEventResources } from './resources/state-event-resources.js';

// Import prompt registrations
import { registerCreationPrompts } from './prompts/creation-prompts.js';
import { registerAnimationPrompts } from './prompts/animation-prompts.js';
import { registerRuntimePrompts } from './prompts/runtime-prompts.js';

/**
 * Main function to start the MCP server
 * @param {Object} options - Server configuration options
 */
async function main(options = {}) {
  console.log('Starting Spline.design MCP Server...');
  
  // Load environment variables if config file is specified
  try {
    if (options.config) {
      const configPath = path.resolve(options.config);
      console.log(`Loading configuration from: ${configPath}`);
      dotenv.config({ path: configPath });
    } else {
      // Try to load from default locations
      const envPath = path.resolve(process.cwd(), '.env');
      const projectEnvPath = path.resolve(__dirname, '../.env');
      
      if (fs.existsSync(envPath)) {
        console.log(`Loading configuration from: ${envPath}`);
        dotenv.config({ path: envPath });
      } else if (fs.existsSync(projectEnvPath)) {
        console.log(`Loading configuration from: ${projectEnvPath}`);
        dotenv.config({ path: projectEnvPath });
      } else {
        console.log('No .env file found, using environment variables only');
        dotenv.config();
      }
    }
  } catch (error) {
    console.warn(`Warning: Error loading configuration: ${error.message}`);
    console.log('Continuing with environment variables only...');
  }

  // Validate API key
  if (!process.env.SPLINE_API_KEY && options.verbose) {
    console.warn('\x1b[33m%s\x1b[0m', 'Warning: SPLINE_API_KEY is not set. API calls may fail.');
  }

  // Create a new MCP server instance
  const server = new McpServer({
    name: 'Spline.design MCP Server',
    version: '1.0.0',
    description: 'Control Spline.design 3D scenes, materials, states, and events'
  });

  // Register tools
  console.log('Registering tools...');
  
  // Basic tools
  registerObjectTools(server);
  registerMaterialTools(server);
  registerStateEventTools(server);
  registerApiWebhookTools(server);
  registerSceneTools(server);
  
  // Advanced tools
  registerActionTools(server);
  registerCompleteEventTools(server);
  registerAdvancedMaterialTools(server);
  registerLightingCameraTools(server);
  
  // Design tools (all the advanced 3D design features including Hana)
  registerDesignTools(server);
  
  // Runtime tools for direct @splinetool/runtime integration
  registerRuntimeTools(server);

  // Register resources
  console.log('Registering resources...');
  registerSceneResources(server);
  registerMaterialResources(server);
  registerStateEventResources(server);

  // Register prompts
  console.log('Registering prompts...');
  registerCreationPrompts(server);
  registerAnimationPrompts(server);
  registerRuntimePrompts(server);

  // Set up the transport based on options
  const transportType = options.transport || 'stdio';
  
  if (transportType === 'http') {
    // Set up HTTP transport
    const port = options.port || 3000;
    
    console.log(`Setting up HTTP transport on port ${port}...`);
    const app = express();
    app.use(express.json());
    
    // Map to store transports by session ID
    const transports = {};
    
    // Handle POST requests
    app.post('/mcp', async (req, res) => {
      // Creating a new transport for each request
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => Math.random().toString(36).substring(2, 15),
        onsessioninitialized: (sessionId) => {
          transports[sessionId] = transport;
        },
      });
      
      // Clean up transport when closed
      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
        }
      };
      
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    });
    
    // Handle GET and DELETE requests
    const handleSessionRequest = async (req, res) => {
      const sessionId = req.headers['mcp-session-id'];
      if (!sessionId || !transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
      }
      
      const transport = transports[sessionId];
      await transport.handleRequest(req, res);
    };
    
    app.get('/mcp', handleSessionRequest);
    app.delete('/mcp', handleSessionRequest);
    
    // Start the HTTP server
    app.listen(port, () => {
      console.log(`Streamable HTTP server listening on port ${port}`);
    });
    
    return { server, app };
  } else {
    // Default to stdio transport for Claude Desktop
    console.log('Setting up stdio transport for Claude Desktop...');
    const transport = new StdioServerTransport();
    
    // Connect the server to the transport
    console.log('Connecting server to transport...');
    await server.connect(transport);
    
    console.log('Server is running and ready to process requests.');
    
    return { server, transport };
  }
}

// If this module is run directly, start the server
if (import.meta.url === import.meta.resolve(process.argv[1])) {
  main().catch(error => {
    console.error('Error starting server:', error);
    process.exit(1);
  });
}

// Export the main function for CLI and programmatic usage
export { main };
