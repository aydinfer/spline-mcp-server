import { z } from 'zod';

/**
 * Prompts for animation and interaction in Spline.design
 * @param {object} server - MCP server instance
 */
export const registerAnimationPrompts = (server) => {
  // Create a rotating animation prompt
  server.prompt(
    'create-rotation-animation',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      objectId: z.string().min(1).describe('Object ID'),
      axis: z.enum(['x', 'y', 'z']).default('y').describe('Rotation axis'),
      duration: z.number().int().min(100).default(2000).describe('Animation duration (ms)'),
      degrees: z.number().default(360).describe('Rotation degrees'),
      easing: z.enum(['linear', 'easeIn', 'easeOut', 'easeInOut']).default('easeInOut')
        .describe('Animation easing'),
      triggerOn: z.enum(['click', 'hover', 'sceneStart']).default('click')
        .describe('Trigger event'),
    },
    ({ sceneId, objectId, axis, duration, degrees, easing, triggerOn }) => {
      const eventType = triggerOn === 'click' ? 'mouseDown' : 
                        triggerOn === 'hover' ? 'mouseOver' : 'sceneStart';
      
      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Create a rotation animation for object ${objectId} in scene ${sceneId} with these properties:
- Rotation Axis: ${axis}
- Duration: ${duration} ms
- Rotation: ${degrees} degrees
- Easing: ${easing}
- Trigger: ${triggerOn}

Follow these steps:
1. Create a new state that changes the ${axis} rotation of the object by ${degrees} degrees
2. Set the transition duration to ${duration} ms and the easing to ${easing}
3. Create a new event of type ${eventType} that triggers this state
4. If ${triggerOn} is 'click' or 'hover', make the event specific to this object

Use the createState tool first, then the createEvent tool to set up the animation.`
          }
        }]
      };
    }
  );

  // Create interactive color change prompt
  server.prompt(
    'create-color-change-interaction',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      objectId: z.string().min(1).describe('Object ID'),
      defaultColor: z.string().default('#ffffff').describe('Default color (hex)'),
      hoverColor: z.string().default('#ff0000').describe('Color on hover (hex)'),
      clickColor: z.string().default('#00ff00').describe('Color on click (hex)'),
      duration: z.number().int().min(100).default(500).describe('Transition duration (ms)'),
    },
    ({ sceneId, objectId, defaultColor, hoverColor, clickColor, duration }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Create an interactive color change effect for object ${objectId} in scene ${sceneId} with these properties:
- Default Color: ${defaultColor}
- Hover Color: ${hoverColor}
- Click Color: ${clickColor}
- Transition Duration: ${duration} ms

Follow these steps:
1. Create three states:
   - A 'default' state with the object's color set to ${defaultColor}
   - A 'hover' state with the object's color set to ${hoverColor}
   - A 'click' state with the object's color set to ${clickColor}
   - Set the transition duration for all states to ${duration} ms

2. Create three events:
   - A 'mouseOver' event that triggers the 'hover' state
   - A 'mouseDown' event that triggers the 'click' state
   - A 'mouseOut' event that triggers the 'default' state
   - Make all events specific to this object

Use the createState tool multiple times to create each state, then use the createEvent tool multiple times to create each event.`
        }
      }]
    })
  );

  // Create API interaction prompt
  server.prompt(
    'create-api-interaction',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      apiUrl: z.string().url().describe('API endpoint URL'),
      method: z.enum(['GET', 'POST']).default('GET').describe('HTTP method'),
      triggerObjectId: z.string().optional().describe('Object ID that triggers API call (optional)'),
      responseMapping: z.array(z.object({
        field: z.string().describe('Response field path (e.g., "data.temperature")'),
        targetObjectId: z.string().describe('Target object ID'),
        property: z.string().describe('Property to update (e.g., "position.y", "color")'),
      })).min(1).describe('Mappings from API response to object properties'),
    },
    ({ sceneId, apiUrl, method, triggerObjectId, responseMapping }) => {
      let mappingsText = '';
      responseMapping.forEach((mapping, index) => {
        mappingsText += `
Mapping ${index + 1}:
- Response Field: ${mapping.field}
- Target Object: ${mapping.targetObjectId}
- Property to Update: ${mapping.property}`;
      });

      const trigger = triggerObjectId 
        ? `The API should be triggered when object ${triggerObjectId} is clicked.`
        : 'The API should be called when the scene starts.';

      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Create an API interaction in scene ${sceneId} with these properties:
- API URL: ${apiUrl}
- Method: ${method}
- ${trigger}
- Response mappings:${mappingsText}

Follow these steps:
1. Use the configureApi tool to set up the API connection
2. Map the API response fields to variables that will affect the specified object properties
3. ${triggerObjectId 
    ? `Create a mouseDown event for object ${triggerObjectId} that triggers the API call`
    : 'Configure the API to be called on scene start'}

The goal is to have the API response affect properties of objects in the scene based on the mappings.`
          }
        }]
      };
    }
  );
};
