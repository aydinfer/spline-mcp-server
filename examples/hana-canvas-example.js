/**
 * Hana Canvas Example
 * 
 * This example demonstrates how to use the Hana canvas tools to create
 * an interactive UI prototype with animations and effects.
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
    name: 'Hana Canvas Example',
    version: '1.0.0',
  });

  await client.connect(transport);
  console.log('Connected to MCP server!');

  // Step 1: Create a new Hana canvas
  console.log('Creating Hana canvas...');
  const createCanvasResult = await client.callTool({
    name: 'createHanaCanvas',
    arguments: {
      projectId: 'example-project-id', // Replace with your project ID
      name: 'Interactive UI Demo',
      width: 1280,
      height: 800,
      background: '#F5F5F5',
      devicePreset: 'desktop',
    },
  });
  
  // Extract scene ID from the result
  const sceneId = extractSceneId(createCanvasResult);
  console.log(`Created Hana canvas with scene ID: ${sceneId}`);

  // Step 2: Add a background rectangle
  console.log('Adding background elements...');
  const backgroundResult = await client.callTool({
    name: 'addHanaElement',
    arguments: {
      sceneId,
      elementType: 'rectangle',
      position: { x: 640, y: 400 },
      size: { width: 1280, height: 800 },
      style: {
        fill: '#111111',
        borderRadius: 0,
      },
      name: 'Background',
    },
  });
  const backgroundId = extractElementId(backgroundResult);

  // Step 3: Add a card element
  console.log('Creating card element...');
  const cardResult = await client.callTool({
    name: 'addHanaElement',
    arguments: {
      sceneId,
      elementType: 'rectangle',
      position: { x: 640, y: 400 },
      size: { width: 480, height: 320 },
      style: {
        fill: '#FFFFFF',
        borderRadius: 16,
        shadow: true,
        shadowBlur: 30,
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOffsetY: 15,
      },
      name: 'Card',
    },
  });
  const cardId = extractElementId(cardResult);

  // Step 4: Add heading text
  console.log('Adding text elements...');
  const headingResult = await client.callTool({
    name: 'addHanaElement',
    arguments: {
      sceneId,
      elementType: 'text',
      position: { x: 640, y: 320 },
      style: {
        text: 'Interactive Prototype',
        fontFamily: 'Inter',
        fontSize: 32,
        fontWeight: 'bold',
        fill: '#333333',
        textAlign: 'center',
      },
      name: 'Heading',
    },
  });
  const headingId = extractElementId(headingResult);

  // Step 5: Add description text
  const descriptionResult = await client.callTool({
    name: 'addHanaElement',
    arguments: {
      sceneId,
      elementType: 'text',
      position: { x: 640, y: 380 },
      size: { width: 400, height: 80 },
      style: {
        text: 'This is an example of a Hana canvas prototype created using the Spline.design MCP server.',
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 'normal',
        fill: '#666666',
        textAlign: 'center',
        lineHeight: 1.5,
      },
      name: 'Description',
    },
  });
  const descriptionId = extractElementId(descriptionResult);

  // Step 6: Add a button
  console.log('Adding interactive button...');
  const buttonResult = await client.callTool({
    name: 'addHanaElement',
    arguments: {
      sceneId,
      elementType: 'button',
      position: { x: 640, y: 470 },
      size: { width: 160, height: 50 },
      style: {
        fill: '#4285F4',
        borderRadius: 8,
        buttonText: 'Click Me',
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#FFFFFF',
      },
      name: 'Button',
    },
  });
  const buttonId = extractElementId(buttonResult);

  // Step 7: Add a hover state for the button
  console.log('Creating button states...');
  await client.callTool({
    name: 'addHanaState',
    arguments: {
      sceneId,
      name: 'Button Hover',
      elementStates: [
        {
          elementId: buttonId,
          properties: {
            fill: '#3367D6',
            shadowBlur: 10,
            shadowColor: 'rgba(66, 133, 244, 0.4)',
            shadowOffsetY: 4,
          },
        },
      ],
      defaultTransition: {
        duration: 0.2,
        easing: 'ease-out',
      },
    },
  });

  // Step 8: Add a press state for the button
  const pressStateResult = await client.callTool({
    name: 'addHanaState',
    arguments: {
      sceneId,
      name: 'Button Press',
      elementStates: [
        {
          elementId: buttonId,
          properties: {
            fill: '#2A56C6',
            shadowBlur: 5,
            shadowColor: 'rgba(66, 133, 244, 0.3)',
            shadowOffsetY: 2,
          },
        },
      ],
      defaultTransition: {
        duration: 0.1,
        easing: 'ease-in',
      },
    },
  });
  const pressStateId = extractStateId(pressStateResult);

  // Step 9: Add a success state for the card
  const successStateResult = await client.callTool({
    name: 'addHanaState',
    arguments: {
      sceneId,
      name: 'Success State',
      elementStates: [
        {
          elementId: cardId,
          properties: {
            fill: '#E8F5E9',
          },
        },
        {
          elementId: headingId,
          properties: {
            text: 'Success!',
            fill: '#0F9D58',
          },
        },
        {
          elementId: descriptionId,
          properties: {
            text: 'You have successfully interacted with this prototype. Well done!',
            fill: '#1B5E20',
          },
        },
        {
          elementId: buttonId,
          properties: {
            fill: '#0F9D58',
            buttonText: 'Done',
          },
        },
      ],
      defaultTransition: {
        duration: 0.5,
        easing: 'ease-in-out',
      },
    },
  });
  const successStateId = extractStateId(successStateResult);

  // Step 10: Add a hover interaction to the button
  console.log('Adding interactions...');
  await client.callTool({
    name: 'addHanaInteraction',
    arguments: {
      sceneId,
      elementId: buttonId,
      eventType: 'mouseEnter',
      actions: [
        {
          actionType: 'changeStyle',
          parameters: {
            fill: '#3367D6',
            shadowBlur: 10,
            shadowColor: 'rgba(66, 133, 244, 0.4)',
            shadowOffsetY: 4,
          },
          duration: 0.2,
          easing: 'ease-out',
        },
      ],
      name: 'Button Hover',
    },
  });

  // Step 11: Add a mouse leave interaction to reset the button
  await client.callTool({
    name: 'addHanaInteraction',
    arguments: {
      sceneId,
      elementId: buttonId,
      eventType: 'mouseLeave',
      actions: [
        {
          actionType: 'changeStyle',
          parameters: {
            fill: '#4285F4',
            shadowBlur: 0,
            shadowColor: 'rgba(0, 0, 0, 0)',
            shadowOffsetY: 0,
          },
          duration: 0.2,
          easing: 'ease-out',
        },
      ],
      name: 'Button Reset',
    },
  });

  // Step 12: Add a click interaction to the button
  await client.callTool({
    name: 'addHanaInteraction',
    arguments: {
      sceneId,
      elementId: buttonId,
      eventType: 'click',
      actions: [
        {
          actionType: 'playAnimation',
          parameters: {
            state: successStateId,
          },
          delay: 0.2,
        },
      ],
      name: 'Button Click',
    },
  });

  // Step 13: Add a glow effect to the button
  console.log('Adding visual effects...');
  await client.callTool({
    name: 'addHanaEffect',
    arguments: {
      sceneId,
      elementId: buttonId,
      effectType: 'glow',
      parameters: {
        glowColor: 'rgba(66, 133, 244, 0.5)',
        glowRadius: 10,
        glowIntensity: 0.5,
        animate: true,
        animationSpeed: 1,
      },
    },
  });

  // Step 14: Create a prototype
  console.log('Creating interactive prototype...');
  await client.callTool({
    name: 'createHanaPrototype',
    arguments: {
      sceneId,
      name: 'Button Interaction Demo',
      startFrame: cardId,
      description: 'A simple interactive prototype demonstrating Hana canvas capabilities',
      settings: {
        defaultTransition: {
          type: 'fade',
          duration: 0.3,
          easing: 'ease-in-out',
        },
        hotspotHinting: true,
        deviceFrame: 'desktop',
      },
    },
  });

  console.log('Hana canvas example completed successfully!');
  console.log('Created elements:');
  console.log(`- Canvas: ${sceneId}`);
  console.log(`- Card: ${cardId}`);
  console.log(`- Button: ${buttonId}`);
  console.log(`- Success State: ${successStateId}`);

  // Close the connection
  await client.disconnect();
}

// Helper functions to extract IDs from tool results
function extractSceneId(result) {
  const text = result.content[0].text;
  const match = text.match(/Scene ID: ([a-zA-Z0-9-_]+)/);
  return match ? match[1] : 'unknown-id';
}

function extractElementId(result) {
  const text = result.content[0].text;
  const match = text.match(/Element ID: ([a-zA-Z0-9-_]+)/);
  return match ? match[1] : 'unknown-id';
}

function extractStateId(result) {
  const text = result.content[0].text;
  const match = text.match(/State ID: ([a-zA-Z0-9-_]+)/);
  return match ? match[1] : 'unknown-id';
}

// Run the example
runExample().catch(error => {
  console.error('Error running example:', error);
});
