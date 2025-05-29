import { z } from 'zod';
import apiClient from '../utils/api-client.js';

/**
 * Comprehensive event management tools for Spline.design
 * Covers all available event types
 * @param {object} server - MCP server instance
 */
export const registerCompleteEventTools = (server) => {
  // Create an event with comprehensive event type support
  server.tool(
    'createComprehensiveEvent',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      name: z.string().min(1).describe('Event name'),
      type: z.enum([
        // Mouse events
        'mouseUp', 'mouseDown', 'mousePress', 'mouseHover', 
        // Keyboard events
        'keyUp', 'keyDown', 'keyPress',
        // Scroll and movement events
        'scroll', 'lookAt', 'follow',
        // Game control events
        'gameControls',
        // Physics and spatial events
        'distance', 'collision', 'triggerArea',
        // UI and state events
        'stateChange', 'variableChange', 'screenResize',
        // External integration events
        'apiUpdated', 'webhookCalled',
        // AI assistant events
        'aiAssistantListener', 'aiAssistantTrigger',
        // Scene events
        'sceneStart', 'sceneLoad', 'sceneUnload'
      ]).describe('Event type'),
      objectId: z.string().optional().describe('Object ID (if object-specific event)'),
      parameters: z.record(z.any()).optional().describe('Event specific parameters (e.g., key codes, trigger distances)'),
      actions: z.array(z.object({
        type: z.string().describe('Action type'),
        target: z.string().optional().describe('Target ID (object, state, etc.)'),
        params: z.record(z.any()).optional().describe('Action parameters'),
      })).min(1).describe('Actions to perform when event is triggered'),
    },
    async ({ sceneId, name, type, objectId, parameters, actions }) => {
      try {
        const eventData = {
          name,
          type,
          ...(objectId && { objectId }),
          ...(parameters && { parameters }),
          actions,
        };
        
        const result = await apiClient.request('POST', `/scenes/${sceneId}/events`, eventData);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Event "${name}" created successfully with ID: ${result.id}` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error creating event: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Configure specific parameters for different event types
  server.tool(
    'configureEventParameters',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      eventId: z.string().min(1).describe('Event ID'),
      eventType: z.string().min(1).describe('Event type'),
      // Dynamic parameters based on event type
      keyCode: z.string().optional().describe('Key code for keyboard events'),
      distance: z.number().optional().describe('Distance for spatial events'),
      targetObjectId: z.string().optional().describe('Target object for lookAt/follow events'),
      variableName: z.string().optional().describe('Variable name for variableChange events'),
      collisionGroup: z.string().optional().describe('Collision group for physics events'),
      triggerArea: z.object({
        position: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }),
        size: z.object({
          x: z.number(),
          y: z.number(),
          z: z.number(),
        }),
      }).optional().describe('Trigger area dimensions'),
      aiPrompt: z.string().optional().describe('Prompt for AI assistant events'),
      customParameters: z.record(z.any()).optional().describe('Any additional custom parameters')
    },
    async ({ 
      sceneId, 
      eventId, 
      eventType, 
      keyCode, 
      distance, 
      targetObjectId, 
      variableName,
      collisionGroup,
      triggerArea,
      aiPrompt,
      customParameters
    }) => {
      try {
        // Construct parameters based on event type
        let parameters = {};
        
        switch (eventType) {
          case 'keyUp':
          case 'keyDown':
          case 'keyPress':
            parameters = { keyCode };
            break;
          case 'distance':
            parameters = { distance, targetObjectId };
            break;
          case 'lookAt':
          case 'follow':
            parameters = { targetObjectId };
            break;
          case 'variableChange':
            parameters = { variableName };
            break;
          case 'collision':
            parameters = { collisionGroup };
            break;
          case 'triggerArea':
            parameters = { triggerArea };
            break;
          case 'aiAssistantListener':
          case 'aiAssistantTrigger':
            parameters = { aiPrompt };
            break;
          default:
            // For other events, use custom parameters
            parameters = customParameters || {};
        }
        
        // Update the event with the configured parameters
        await apiClient.request('PUT', `/scenes/${sceneId}/events/${eventId}/parameters`, parameters);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Parameters for event ${eventId} configured successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring event parameters: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );
};
