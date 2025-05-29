/**
 * Advanced Design Example
 * 
 * This example demonstrates how to use the advanced design tools
 * to create a complex 3D scene with parametric objects, boolean operations,
 * text, and materials.
 */

// Connect to the MCP server
const { Client } = require('@modelcontextprotocol/sdk/client');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio');

async function runExample() {
  console.log('Connecting to Spline.design MCP Server...');
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['../src/index.js'],
  });

  const client = new Client({
    name: 'Design Example',
    version: '1.0.0',
  });

  await client.connect(transport);
  console.log('Connected to MCP server!');

  // Create a new scene or use existing one
  const sceneId = 'example-scene-id'; // Replace with your scene ID

  // Step 1: Create parametric objects
  console.log('Creating base objects...');
  
  // Create a cube
  const cubeResult = await client.callTool({
    name: 'createParametricObject',
    arguments: {
      sceneId,
      type: 'cube',
      parameters: {
        width: 2,
        height: 2,
        depth: 2,
      },
      position: { x: 0, y: 0, z: 0 },
    },
  });
  const cubeId = extractObjectId(cubeResult);
  
  // Create a sphere
  const sphereResult = await client.callTool({
    name: 'createParametricObject',
    arguments: {
      sceneId,
      type: 'sphere',
      parameters: {
        radius: 1.3,
        segments: 32,
      },
      position: { x: 0, y: 0, z: 0 },
    },
  });
  const sphereId = extractObjectId(sphereResult);

  // Step 2: Create a material
  console.log('Creating material...');
  const materialResult = await client.callTool({
    name: 'createLayeredMaterial',
    arguments: {
      sceneId,
      name: 'Glass Material',
      baseType: 'standard',
    },
  });
  const materialId = extractMaterialId(materialResult);

  // Add glass layer properties
  await client.callTool({
    name: 'addMaterialLayer',
    arguments: {
      sceneId,
      materialId,
      type: 'glass',
      properties: {
        roughness: 0.1,
        transparency: 0.8,
        ior: 1.5,
      },
    },
  });

  // Step 3: Perform boolean operation
  console.log('Performing boolean operation...');
  const booleanResult = await client.callTool({
    name: 'createBooleanOperation',
    arguments: {
      sceneId,
      operation: 'subtract',
      targetObjectId: cubeId,
      sourceObjectIds: [sphereId],
      createNewObject: true,
      keepOriginals: false,
    },
  });
  const resultObjectId = extractObjectId(booleanResult);

  // Step 4: Apply material to the result
  console.log('Applying material...');
  await client.callTool({
    name: 'updateObject',
    arguments: {
      sceneId,
      objectId: resultObjectId,
      materials: [materialId],
    },
  });

  // Step 5: Create text
  console.log('Creating 3D text...');
  const textResult = await client.callTool({
    name: 'create3DText',
    arguments: {
      sceneId,
      text: 'SPLINE',
      font: 'Helvetica',
      size: 0.5,
      depth: 0.1,
      position: { x: 0, y: -2, z: 0 },
      alignment: 'center',
      is3D: true,
    },
  });
  const textId = extractObjectId(textResult);

  // Step 6: Create a particle system
  console.log('Creating particle system...');
  await client.callTool({
    name: 'createParticleSystem',
    arguments: {
      sceneId,
      emitterType: 'sphere',
      position: { x: 0, y: 0, z: 0 },
      parameters: {
        rate: 50,
        radius: 1.5,
        particleSize: 0.05,
        lifetime: 2,
        startColor: '#4285F4',
        endColor: '#34A853',
        startOpacity: 1,
        endOpacity: 0,
        gravity: { x: 0, y: 0.2, z: 0 },
      },
    },
  });

  // Step 7: Set up physics
  console.log('Setting up physics...');
  await client.callTool({
    name: 'addPhysicsBody',
    arguments: {
      sceneId,
      objectId: resultObjectId,
      bodyType: 'dynamic',
      shape: 'auto',
      mass: 1,
      parameters: {
        restitution: 0.7,
        friction: 0.3,
      },
    },
  });

  // Step 8: Create a camera
  console.log('Setting up camera...');
  const cameraResult = await client.callTool({
    name: 'createCamera',
    arguments: {
      sceneId,
      type: 'perspective',
      position: { x: 0, y: 0, z: 5 },
      target: { x: 0, y: 0, z: 0 },
      parameters: {
        fov: 50,
        near: 0.1,
        far: 1000,
      },
    },
  });
  const cameraId = extractObjectId(cameraResult);

  // Step 9: Add post-processing effect
  await client.callTool({
    name: 'addPostProcessingEffect',
    arguments: {
      sceneId,
      cameraId,
      type: 'bloom',
      parameters: {
        intensity: 0.3,
        threshold: 0.8,
      },
    },
  });

  console.log('Advanced design example completed successfully!');
  console.log('Created objects:');
  console.log(`- Boolean result: ${resultObjectId}`);
  console.log(`- Text: ${textId}`);
  console.log(`- Material: ${materialId}`);
  console.log(`- Camera: ${cameraId}`);

  // Close the connection
  await client.disconnect();
}

// Helper functions to extract IDs from tool results
function extractObjectId(result) {
  const text = result.content[0].text;
  const match = text.match(/ID: ([a-zA-Z0-9-_]+)/);
  return match ? match[1] : 'unknown-id';
}

function extractMaterialId(result) {
  const text = result.content[0].text;
  const match = text.match(/ID: ([a-zA-Z0-9-_]+)/);
  return match ? match[1] : 'unknown-id';
}

// Run the example
runExample().catch(error => {
  console.error('Error running example:', error);
});
