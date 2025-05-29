# Spline MCP Server Test Cases

This document provides specific test cases for validating the Spline MCP server functionality.

## Prerequisites

Before running these tests, ensure you have:
1. A valid Spline.design account with API access
2. At least one scene created in Spline
3. Your scene ID (found in Spline's interface)

## Test Cases

### 1. Basic Connectivity Test

**Test**: Server starts and responds to initialization
```json
// This happens automatically when the inspector connects
```

**Expected Result**: Server shows as "Connected" in MCP Inspector

### 2. List Available Scenes

**Tool**: `getScenes`
```json
{
  "tool": "getScenes",
  "parameters": {
    "limit": 5,
    "offset": 0
  }
}
```

**Expected Result**: Returns a list of your Spline scenes

### 3. Create a Simple Cube

**Tool**: `createObject`
```json
{
  "tool": "createObject",
  "parameters": {
    "sceneId": "YOUR_SCENE_ID_HERE",
    "type": "cube",
    "name": "Test Cube",
    "position": {
      "x": 0,
      "y": 1,
      "z": 0
    },
    "scale": {
      "x": 1,
      "y": 1,
      "z": 1
    },
    "color": "#3a86ff"
  }
}
```

**Expected Result**: Returns object ID of created cube

### 4. List Objects in Scene

**Tool**: `getObjects`
```json
{
  "tool": "getObjects",
  "parameters": {
    "sceneId": "YOUR_SCENE_ID_HERE"
  }
}
```

**Expected Result**: Returns list including the test cube

### 5. Create and Apply Material

**Tool**: `createMaterial`
```json
{
  "tool": "createMaterial",
  "parameters": {
    "sceneId": "YOUR_SCENE_ID_HERE",
    "name": "Glossy Red",
    "type": "physical",
    "color": "#ff006e",
    "roughness": 0.2,
    "metalness": 0.8
  }
}
```

**Tool**: `applyMaterial`
```json
{
  "tool": "applyMaterial",
  "parameters": {
    "sceneId": "YOUR_SCENE_ID_HERE",
    "objectId": "CUBE_ID_FROM_STEP_3",
    "materialId": "MATERIAL_ID_FROM_ABOVE"
  }
}
```

### 6. Create Animation State

**Tool**: `createState`
```json
{
  "tool": "createState",
  "parameters": {
    "sceneId": "YOUR_SCENE_ID_HERE",
    "name": "Rotate State",
    "properties": [{
      "objectId": "CUBE_ID_FROM_STEP_3",
      "property": "rotation.y",
      "value": 180
    }],
    "transitionDuration": 1000,
    "transitionEasing": "easeInOut"
  }
}
```

### 7. Create Click Event

**Tool**: `createComprehensiveEvent`
```json
{
  "tool": "createComprehensiveEvent",
  "parameters": {
    "sceneId": "YOUR_SCENE_ID_HERE",
    "name": "Cube Click",
    "type": "mouseDown",
    "objectId": "CUBE_ID_FROM_STEP_3",
    "actions": [{
      "type": "triggerState",
      "target": "STATE_ID_FROM_STEP_6",
      "params": {}
    }]
  }
}
```

### 8. Create Parametric Object

**Tool**: `createParametricObject`
```json
{
  "tool": "createParametricObject",
  "parameters": {
    "sceneId": "YOUR_SCENE_ID_HERE",
    "name": "Torus Ring",
    "type": "torus",
    "parameters": {
      "radius": 2,
      "tubeRadius": 0.5,
      "radiusSegments": 32,
      "segments": 24
    },
    "position": {
      "x": 3,
      "y": 1,
      "z": 0
    },
    "color": "#ffbe0b"
  }
}
```

### 9. Create 3D Text

**Tool**: `create3DText`
```json
{
  "tool": "create3DText",
  "parameters": {
    "sceneId": "YOUR_SCENE_ID_HERE",
    "name": "Welcome Text",
    "text": "HELLO",
    "font": "Arial",
    "size": 2,
    "depth": 0.3,
    "position": {
      "x": -2,
      "y": 3,
      "z": 0
    },
    "color": "#fb5607",
    "bevelEnabled": true,
    "bevelThickness": 0.1,
    "bevelSize": 0.05
  }
}
```

### 10. Access Resources

**Resource**: Scene details
```
spline://scene/YOUR_SCENE_ID_HERE
```

**Resource**: Objects list
```
spline://scene/YOUR_SCENE_ID_HERE/objects
```

**Resource**: Materials list
```
spline://scene/YOUR_SCENE_ID_HERE/materials
```

### 11. Test Advanced Features

**Tool**: `createParticles`
```json
{
  "tool": "createParticles",
  "parameters": {
    "sceneId": "YOUR_SCENE_ID_HERE",
    "name": "Sparkles",
    "emitterType": "point",
    "maxParticles": 500,
    "emissionRate": 20,
    "lifetime": {
      "min": 1,
      "max": 3
    },
    "startSize": {
      "min": 0.1,
      "max": 0.3
    },
    "endSize": {
      "min": 0,
      "max": 0.1
    },
    "startColor": "#ffffff",
    "endColor": "#3a86ff",
    "position": {
      "x": 0,
      "y": 5,
      "z": 0
    },
    "blendMode": "additive"
  }
}
```

## Validation Checklist

- [ ] Server connects successfully
- [ ] Can list scenes
- [ ] Can create basic objects
- [ ] Can list objects in a scene
- [ ] Can create and apply materials
- [ ] Can create states for animation
- [ ] Can create events for interactivity
- [ ] Can access resources
- [ ] Can create advanced objects (parametric, text, particles)
- [ ] Error handling works properly

## Common Error Messages

1. **"Invalid scene ID"**: Make sure you're using a valid scene ID from your Spline account
2. **"Unauthorized"**: Check that your API key is correct in the .env file
3. **"Object not found"**: Verify the object ID exists in the scene
4. **"Invalid parameters"**: Check that all required parameters are provided

## Tips for Testing

1. Start with basic operations (list scenes, create simple objects)
2. Note down IDs returned from create operations for use in subsequent tests
3. Check the Spline web interface to verify objects are being created
4. Use the browser's developer console in the Inspector to see detailed logs
5. Test error cases (invalid IDs, missing parameters) to ensure proper error handling

## Next Steps

After successful testing:
1. Create more complex scenes programmatically
2. Test with Claude Desktop
3. Build automated workflows
4. Integrate with other tools

Remember to replace placeholder values like `YOUR_SCENE_ID_HERE` with actual IDs from your Spline account.
