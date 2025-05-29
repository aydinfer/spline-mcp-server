# Testing Spline MCP Server with MCP Inspector

This guide will help you test your Spline.design MCP server using the MCP Inspector tool.

## Prerequisites

1. Ensure you have the MCP Inspector installed:
   ```bash
   git clone https://github.com/modelcontextprotocol/inspector
   cd inspector
   npm install
   ```

2. Navigate to your Spline MCP server directory:
   ```bash
   cd /Users/fer/Desktop/Coder/spline-mcp-server
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up your environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
   ```

## Testing the Server

### 1. Direct Test (Optional)

First, test that your server starts correctly:

```bash
chmod +x test-server.sh
./test-server.sh
```

### 2. Using MCP Inspector

1. Navigate to the inspector directory:
   ```bash
   cd /path/to/inspector
   ```

2. Run the inspector with your Spline MCP configuration:
   ```bash
   npm start -- --config /Users/fer/Desktop/Coder/spline-mcp-server/inspector-config.json
   ```

3. The inspector will open in your browser (usually at http://localhost:5173)

4. In the inspector interface, you should see:
   - Your "spline-design" server listed
   - Available tools, resources, and prompts

## Testing Features

### Available Tools to Test

1. **Object Management**
   - `getObjects` - List all objects in a scene
   - `createObject` - Create a new 3D object
   - `updateObject` - Modify object properties
   - `deleteObject` - Remove an object

2. **Material Control**
   - `getMaterials` - List available materials
   - `createMaterial` - Create new materials
   - `applyMaterial` - Apply material to objects

3. **Events and Actions**
   - `createComprehensiveEvent` - Create any Spline event
   - `createAction` - Create standalone actions
   - `triggerEvent` - Trigger specific events

4. **Advanced 3D Design**
   - `createParametricObject` - Create parametric shapes
   - `booleanOperation` - Perform boolean operations
   - `createParticles` - Create particle systems
   - `create3DText` - Create 3D text objects

### Example Test Workflow

1. **Get Scenes**
   ```json
   {
     "tool": "getScenes",
     "parameters": {
       "limit": 10,
       "offset": 0
     }
   }
   ```

2. **Create a Simple Object**
   ```json
   {
     "tool": "createObject",
     "parameters": {
       "sceneId": "your-scene-id",
       "type": "cube",
       "name": "Test Cube",
       "position": {
         "x": 0,
         "y": 0,
         "z": 0
       },
       "color": "#ff0000"
     }
   }
   ```

3. **List Resources**
   - Access: `spline://scenes`
   - Or: `spline://scene/{sceneId}/objects`

## Troubleshooting

### Common Issues

1. **Server won't start**
   - Check that all dependencies are installed
   - Verify your .env file has valid API keys
   - Ensure Node.js version is compatible

2. **Connection errors in inspector**
   - Verify the path in inspector-config.json is correct
   - Check that no other process is using the same port
   - Look at console logs for specific error messages

3. **API errors**
   - Ensure your Spline API key is valid
   - Check that you have the necessary permissions
   - Verify scene IDs are correct

### Debug Mode

To see detailed logs, modify the server start command:

```bash
NODE_ENV=development node src/index.js
```

## Important Notes

1. Replace placeholder values:
   - `your_spline_api_key_here` in inspector-config.json
   - `your_openai_api_key_here` if using AI features
   - Scene IDs in test examples

2. The server operates in stdio mode for the inspector, which means:
   - Input/output happens through standard streams
   - The server stays running until terminated
   - Logs appear in the console

3. Available resources follow this pattern:
   - `spline://scenes` - List all scenes
   - `spline://scene/{sceneId}` - Get scene details
   - `spline://scene/{sceneId}/objects` - List objects
   - `spline://scene/{sceneId}/materials` - List materials

## Next Steps

After successful testing:

1. Document any specific scene IDs you'll be working with
2. Create custom prompts for your workflow
3. Build example integrations
4. Test with Claude Desktop once verified with inspector

For more detailed information, see the main README.md and USAGE_GUIDE.md files.
