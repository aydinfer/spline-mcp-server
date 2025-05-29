import { z } from 'zod';
import apiClient from '../utils/api-client.js';
import runtimeManager from '../utils/runtime-manager.js';

/**
 * State and Event management tools for Spline.design
 * @param {object} server - MCP server instance
 */
export const registerStateEventTools = (server) => {
  // Get all states in a scene
  server.tool(
    'getStates',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
    },
    async ({ sceneId }) => {
      try {
        const states = await apiClient.getStates(sceneId);
        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(states, null, 2) 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error retrieving states: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Get details of a specific state
  server.tool(
    'getStateDetails',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      stateId: z.string().min(1).describe('State ID'),
    },
    async ({ sceneId, stateId }) => {
      try {
        const state = await apiClient.getState(sceneId, stateId);
        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(state, null, 2) 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error retrieving state details: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Create a new state
  server.tool(
    'createState',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      name: z.string().min(1).describe('State name'),
      properties: z.array(z.object({
        objectId: z.string().min(1).describe('Object ID'),
        property: z.string().min(1).describe('Property to change'),
        value: z.any().describe('Value to set'),
      })).min(1).describe('State properties'),
      transitionDuration: z.number().min(0).optional().describe('Transition duration in ms'),
      transitionEasing: z.enum(['linear', 'easeIn', 'easeOut', 'easeInOut']).optional()
        .describe('Easing function for transitions'),
    },
    async ({ sceneId, name, properties, transitionDuration, transitionEasing }) => {
      try {
        const stateData = {
          name,
          properties,
          ...(transitionDuration !== undefined && { transitionDuration }),
          ...(transitionEasing && { transitionEasing }),
        };
        
        const result = await apiClient.request('POST', `/scenes/${sceneId}/states`, stateData);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `State created successfully with ID: ${result.id}` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error creating state: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Trigger a state
  server.tool(
    'triggerState',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      stateId: z.string().min(1).describe('State ID'),
    },
    async ({ sceneId, stateId }) => {
      try {
        await apiClient.triggerState(sceneId, stateId);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `State ${stateId} triggered successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error triggering state: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Get all events in a scene
  server.tool(
    'getEvents',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
    },
    async ({ sceneId }) => {
      try {
        const events = await apiClient.getEvents(sceneId);
        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(events, null, 2) 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error retrieving events: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Get details of a specific event
  server.tool(
    'getEventDetails',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      eventId: z.string().min(1).describe('Event ID'),
    },
    async ({ sceneId, eventId }) => {
      try {
        const event = await apiClient.getEvent(sceneId, eventId);
        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(event, null, 2) 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error retrieving event details: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Create a new event
  server.tool(
    'createEvent',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      name: z.string().min(1).describe('Event name'),
      type: z.enum([
        'mouseDown', 'mouseUp', 'mouseOver', 'mouseOut', 'mouseMove',
        'touchStart', 'touchEnd', 'touchMove',
        'keyDown', 'keyUp',
        'collision', 'sceneStart', 'custom'
      ]).describe('Event type'),
      objectId: z.string().optional().describe('Object ID (if object-specific event)'),
      actions: z.array(z.object({
        type: z.enum([
          'triggerState', 'setProperty', 'playAnimation', 
          'callFunction', 'triggerEvent', 'setVariable'
        ]).describe('Action type'),
        target: z.string().optional().describe('Target ID (object, state, etc.)'),
        params: z.record(z.any()).optional().describe('Action parameters'),
      })).min(1).describe('Actions to perform when event is triggered'),
    },
    async ({ sceneId, name, type, objectId, actions }) => {
      try {
        const eventData = {
          name,
          type,
          ...(objectId && { objectId }),
          actions,
        };
        
        const result = await apiClient.request('POST', `/scenes/${sceneId}/events`, eventData);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Event created successfully with ID: ${result.id}` 
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

  // Trigger an event
  server.tool(
    'triggerEvent',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      eventId: z.string().min(1).describe('Event ID'),
      eventData: z.record(z.any()).optional().describe('Event data'),
    },
    async ({ sceneId, eventId, eventData }) => {
      try {
        await apiClient.triggerEvent(sceneId, eventId, eventData || {});
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Event ${eventId} triggered successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error triggering event: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Generate event listener code
  server.tool(
    'generateEventListenerCode',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      eventName: z.enum([
        'mouseDown', 'mouseUp', 'mouseOver', 'mouseOut', 'mouseMove',
        'touchStart', 'touchEnd', 'touchMove',
        'keyDown', 'keyUp', 'collision', 'sceneStart'
      ]).describe('Event name'),
    },
    async ({ sceneId, eventName }) => {
      try {
        const code = runtimeManager.generateEventListenerCode(sceneId, eventName);
        
        return {
          content: [
            { 
              type: 'text', 
              text: code 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error generating code: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );
};
