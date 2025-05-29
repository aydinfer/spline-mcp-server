# Spline.design MCP Server Usage Guide

This guide provides detailed instructions on how to use the Spline.design MCP server with Claude Desktop to control and interact with Spline 3D scenes.

## Table of Contents

- [Initial Setup](#initial-setup)
- [Connecting to Claude Desktop](#connecting-to-claude-desktop)
- [Working with Scenes](#working-with-scenes)
- [Managing Objects](#managing-objects)
- [Material Operations](#material-operations)
- [States and Animations](#states-and-animations)
- [Events and Interactions](#events-and-interactions)
- [API and Webhook Integration](#api-and-webhook-integration)
- [Common Workflows](#common-workflows)
- [Troubleshooting](#troubleshooting)

## Initial Setup

Before using the Spline.design MCP server, you need to complete these setup steps:

1. Clone the repository and navigate to the project directory
   ```
   cd spline-mcp-server
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file from the example
   ```
   cp .env.example .env
   ```

4. Edit the `.env` file to add your Spline API key and other configurations
   ```
   SPLINE_API_KEY=your_spline_api_key_here
   SPLINE_PROJECT_ID=your_project_id_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. Start the server
   ```
   npm start
   ```

## Connecting to Claude Desktop

To connect the MCP server to Claude Desktop:

1. Open Claude Desktop
2. Click on the "MCP" button in the bottom-right corner
3. Click "Connect to MCP Server"
4. Select "Manual Connection"
5. Choose "Stdio" as the transport
6. Enter the path to your server: `/path/to/spline-mcp-server/src/index.js`
7. Click "Connect"

You should see a success message when the connection is established. Claude can now interact with your Spline scenes.

## Working with Scenes

### Viewing Available Scenes

To see a list of available scenes, Claude can access this resource:
```
spline://scenes
```

### Getting Scene Details

To get detailed information about a specific scene, use:
```
spline://scene/{sceneId}
```

Replace `{sceneId}` with the actual scene ID.

### Exporting a Scene

To export a scene as code, ask Claude to use the `exportSceneCode` tool:

```
Please export the scene with ID "abc123" as React code.
```

Claude will use the `exportSceneCode` tool with the appropriate parameters.

## Managing Objects

### Viewing Objects in a Scene

To see all objects in a scene, access:
```
spline://scene/{sceneId}/objects
```

### Creating Objects

To create a new object, ask Claude to use the `createObject` tool:

```
Please create a red cube in the scene abc123, with a size of 2x2x2, positioned at coordinates (1, 0, 3).
```

You can also use the `create-cube` prompt for a simpler interface:

```
Please use the create-cube prompt with scene ID "abc123", name "My Cube", size 2, and color "#ff0000".
```

### Updating Objects

To modify an existing object, ask Claude to use the `updateObject` tool:

```
Please update the object with ID "xyz789" in scene "abc123" to have a blue color and make it twice as large.
```

## Material Operations

### Viewing Materials

To see all materials in a scene, access:
```
spline://scene/{sceneId}/materials
```

### Creating Materials

To create a new material, ask Claude to use the `createMaterial` tool:

```
Please create a glossy metallic material in scene "abc123" with a silver color.
```

### Applying Materials

To apply a material to an object, use the `applyMaterial` tool:

```
Please apply the material with ID "mat456" to the object with ID "xyz789" in scene "abc123".
```

You can also use the `create-apply-material` prompt for a combined operation:

```
Please use the create-apply-material prompt to create a glossy red material and apply it to object "xyz789" in scene "abc123".
```

## States and Animations

### Creating States

To create a new state, use the `createState` tool:

```
Please create a state in scene "abc123" that moves the object "xyz789" up by 2 units over 500ms with an easeOut easing.
```

### Triggering States

To trigger a state, use the `triggerState` tool:

```
Please trigger the state with ID "state123" in scene "abc123".
```

### Creating Animations

For animations, use the `create-rotation-animation` prompt:

```
Please use the create-rotation-animation prompt to make object "xyz789" in scene "abc123" rotate 360 degrees around the Y axis when clicked.
```

## Events and Interactions

### Creating Events

To create a new event, use the `createEvent` tool:

```
Please create a mouseDown event for object "xyz789" in scene "abc123" that triggers state "state123".
```

### Triggering Events

To trigger an event, use the `triggerEvent` tool:

```
Please trigger the event with ID "event456" in scene "abc123".
```

### Creating Interactive Behaviors

For interactive behaviors, use the `create-color-change-interaction` prompt:

```
Please use the create-color-change-interaction prompt to make object "xyz789" in scene "abc123" change color when hovered and clicked.
```

## API and Webhook Integration

### Configuring API Connections

To set up an API connection, use the `configureApi` tool:

```
Please configure an API connection in scene "abc123" to fetch data from "https://api.weather.com/current" and map the temperature to the y-position of object "xyz789".
```

### Creating Webhooks

To create a webhook, use the `createWebhook` tool:

```
Please create a webhook in scene "abc123" that maps incoming data to update the rotation of object "xyz789".
```

### Setting Up API Interactions

For API interactions, use the `create-api-interaction` prompt:

```
Please use the create-api-interaction prompt to connect scene "abc123" to a weather API and update object properties based on the weather data.
```

## Common Workflows

### Creating a Complete Interactive Scene

This workflow combines multiple operations to create a fully interactive scene:

```
Please help me create an interactive scene in Spline. I want to:
1. Create a sphere, a cube, and a cylinder
2. Apply different materials to each object
3. Make the sphere rotate when clicked
4. Make the cube change color when hovered
5. Make the cylinder move up and down when clicked
```

Claude will guide you through using the appropriate tools and prompts to accomplish this.

### Adding Real-time Data Visualization

This workflow shows how to connect your scene to external data:

```
Please help me set up a real-time data visualization in my Spline scene "abc123". I want to:
1. Connect to a cryptocurrency price API
2. Update the height of object "xyz789" based on Bitcoin price
3. Change the color of object "xyz456" based on price change percentage
```

## Troubleshooting

### Common Issues and Solutions

1. **Connection problems**: 
   - Make sure the server is running (`npm start`)
   - Check that your Claude Desktop has the correct path to the server

2. **Authentication errors**:
   - Verify your Spline API key in the `.env` file
   - Check that your API key has the necessary permissions

3. **Missing objects or scenes**:
   - Double-check all IDs for accuracy
   - Verify that the resources exist in your Spline account

4. **API or webhook integration issues**:
   - Check CORS settings for your APIs
   - Verify your API endpoints are accessible

For more help, check the Spline.design documentation or reach out to their support team.
