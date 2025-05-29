import { z } from 'zod';
import apiClient from '../utils/api-client.js';

/**
 * Action management tools for Spline.design
 * @param {object} server - MCP server instance
 */
export const registerActionTools = (server) => {
  // Create an action
  server.tool(
    'createAction',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      eventId: z.string().min(1).describe('Event ID to attach this action to'),
      type: z.enum([
        'transition', 'sound', 'video', 'openLink', 'resetScene',
        'switchCamera', 'createObject', 'destroyObject', 'sceneTransition',
        'animation', 'particlesControl', 'variableControl', 'conditional',
        'setVariable', 'clearLocalStorage', 'apiRequest'
      ]).describe('Action type'),
      name: z.string().min(1).describe('Action name'),
      target: z.string().optional().describe('Target ID (object, state, camera, etc.)'),
      parameters: z.record(z.any()).optional().describe('Action parameters'),
    },
    async ({ sceneId, eventId, type, name, target, parameters }) => {
      try {
        const actionData = {
          type,
          name,
          ...(target && { target }),
          ...(parameters && { parameters }),
        };
        
        const result = await apiClient.request('POST', `/scenes/${sceneId}/events/${eventId}/actions`, actionData);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Action "${name}" created successfully with ID: ${result.id}` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error creating action: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Configure transition action
  server.tool(
    'configureTransitionAction',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      actionId: z.string().min(1).describe('Action ID'),
      targetState: z.string().min(1).describe('Target state ID'),
      duration: z.number().min(0).optional().describe('Transition duration (ms)'),
      easing: z.enum(['linear', 'easeIn', 'easeOut', 'easeInOut']).optional()
        .describe('Transition easing'),
      delay: z.number().min(0).optional().describe('Delay before starting transition (ms)'),
    },
    async ({ sceneId, actionId, targetState, duration, easing, delay }) => {
      try {
        const parameters = {
          targetState,
          ...(duration !== undefined && { duration }),
          ...(easing && { easing }),
          ...(delay !== undefined && { delay }),
        };
        
        await apiClient.request('PUT', `/scenes/${sceneId}/actions/${actionId}`, {
          type: 'transition',
          parameters
        });
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Transition action ${actionId} configured successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring transition action: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Configure sound action
  server.tool(
    'configureSoundAction',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      actionId: z.string().min(1).describe('Action ID'),
      soundUrl: z.string().url().describe('URL to sound file'),
      volume: z.number().min(0).max(1).optional().default(1).describe('Volume (0-1)'),
      loop: z.boolean().optional().default(false).describe('Whether to loop the sound'),
      spatial: z.boolean().optional().default(false).describe('Whether sound is spatial (3D)'),
      objectId: z.string().optional().describe('Object ID for spatial sound source'),
    },
    async ({ sceneId, actionId, soundUrl, volume, loop, spatial, objectId }) => {
      try {
        const parameters = {
          soundUrl,
          volume,
          loop,
          spatial,
          ...(spatial && objectId && { objectId }),
        };
        
        await apiClient.request('PUT', `/scenes/${sceneId}/actions/${actionId}`, {
          type: 'sound',
          parameters
        });
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Sound action ${actionId} configured successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring sound action: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Configure animation action
  server.tool(
    'configureAnimationAction',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      actionId: z.string().min(1).describe('Action ID'),
      objectId: z.string().min(1).describe('Object ID to animate'),
      animationType: z.enum(['rotate', 'move', 'scale', 'fade']).describe('Animation type'),
      duration: z.number().min(0).describe('Animation duration (ms)'),
      easing: z.enum(['linear', 'easeIn', 'easeOut', 'easeInOut']).optional()
        .describe('Animation easing'),
      parameters: z.record(z.any()).describe('Animation-specific parameters'),
    },
    async ({ sceneId, actionId, objectId, animationType, duration, easing, parameters }) => {
      try {
        const actionParameters = {
          objectId,
          animationType,
          duration,
          ...(easing && { easing }),
          ...parameters,
        };
        
        await apiClient.request('PUT', `/scenes/${sceneId}/actions/${actionId}`, {
          type: 'animation',
          parameters: actionParameters
        });
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Animation action ${actionId} configured successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring animation action: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Configure variable control action
  server.tool(
    'configureVariableAction',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      actionId: z.string().min(1).describe('Action ID'),
      variableName: z.string().min(1).describe('Variable name'),
      operation: z.enum(['set', 'increment', 'decrement', 'multiply', 'divide', 'toggle'])
        .describe('Operation to perform'),
      value: z.any().describe('Value to use in the operation'),
    },
    async ({ sceneId, actionId, variableName, operation, value }) => {
      try {
        const parameters = {
          variableName,
          operation,
          value,
        };
        
        await apiClient.request('PUT', `/scenes/${sceneId}/actions/${actionId}`, {
          type: 'variableControl',
          parameters
        });
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Variable control action ${actionId} configured successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring variable control action: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Configure conditional action
  server.tool(
    'configureConditionalAction',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      actionId: z.string().min(1).describe('Action ID'),
      variableName: z.string().min(1).describe('Variable name to check'),
      condition: z.enum(['equals', 'notEquals', 'greaterThan', 'lessThan', 'contains'])
        .describe('Condition to check'),
      value: z.any().describe('Value to compare against'),
      trueActionIds: z.array(z.string()).describe('Actions to trigger if condition is true'),
      falseActionIds: z.array(z.string()).optional().describe('Actions to trigger if condition is false'),
    },
    async ({ sceneId, actionId, variableName, condition, value, trueActionIds, falseActionIds }) => {
      try {
        const parameters = {
          variableName,
          condition,
          value,
          trueActions: trueActionIds,
          ...(falseActionIds && { falseActions: falseActionIds }),
        };
        
        await apiClient.request('PUT', `/scenes/${sceneId}/actions/${actionId}`, {
          type: 'conditional',
          parameters
        });
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Conditional action ${actionId} configured successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring conditional action: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Configure API request action
  server.tool(
    'configureApiRequestAction',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      actionId: z.string().min(1).describe('Action ID'),
      apiId: z.string().min(1).describe('API configuration ID'),
      mappings: z.array(z.object({
        responseField: z.string().describe('Field from API response'),
        variableName: z.string().describe('Spline variable name'),
        variableType: z.enum(['string', 'number', 'boolean']).describe('Variable type'),
      })).optional().describe('Response mappings'),
    },
    async ({ sceneId, actionId, apiId, mappings }) => {
      try {
        const parameters = {
          apiId,
          ...(mappings && { mappings }),
        };
        
        await apiClient.request('PUT', `/scenes/${sceneId}/actions/${actionId}`, {
          type: 'apiRequest',
          parameters
        });
        
        return {
          content: [
            { 
              type: 'text', 
              text: `API request action ${actionId} configured successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring API request action: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Configure camera action
  server.tool(
    'configureCameraAction',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      actionId: z.string().min(1).describe('Action ID'),
      cameraId: z.string().min(1).describe('Camera ID to switch to'),
      duration: z.number().min(0).optional().describe('Transition duration (ms)'),
      easing: z.enum(['linear', 'easeIn', 'easeOut', 'easeInOut']).optional()
        .describe('Transition easing'),
    },
    async ({ sceneId, actionId, cameraId, duration, easing }) => {
      try {
        const parameters = {
          cameraId,
          ...(duration !== undefined && { duration }),
          ...(easing && { easing }),
        };
        
        await apiClient.request('PUT', `/scenes/${sceneId}/actions/${actionId}`, {
          type: 'switchCamera',
          parameters
        });
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Camera action ${actionId} configured successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring camera action: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // List actions for an event
  server.tool(
    'listActions',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      eventId: z.string().min(1).describe('Event ID'),
    },
    async ({ sceneId, eventId }) => {
      try {
        const actions = await apiClient.request('GET', `/scenes/${sceneId}/events/${eventId}/actions`);
        
        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(actions, null, 2) 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error listing actions: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Delete an action
  server.tool(
    'deleteAction',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      eventId: z.string().min(1).describe('Event ID'),
      actionId: z.string().min(1).describe('Action ID'),
    },
    async ({ sceneId, eventId, actionId }) => {
      try {
        await apiClient.request('DELETE', `/scenes/${sceneId}/events/${eventId}/actions/${actionId}`);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Action ${actionId} deleted successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error deleting action: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );
};
