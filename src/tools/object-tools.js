import { z } from 'zod';
import apiClient from '../utils/api-client.js';
import runtimeManager from '../utils/runtime-manager.js';

/**
 * Object management tools for Spline.design
 * @param {object} server - MCP server instance
 */
export const registerObjectTools = (server) => {
  // Get all objects in a scene
  server.tool(
    'getObjects',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
    },
    async ({ sceneId }) => {
      try {
        const objects = await apiClient.getObjects(sceneId);
        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(objects, null, 2) 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error retrieving objects: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Get details of a specific object
  server.tool(
    'getObjectDetails',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      objectId: z.string().min(1).describe('Object ID'),
    },
    async ({ sceneId, objectId }) => {
      try {
        const object = await apiClient.getObject(sceneId, objectId);
        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(object, null, 2) 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error retrieving object details: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Create a new 3D object
  server.tool(
    'createObject',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      type: z.enum([
        'cube', 'sphere', 'cylinder', 'cone', 'torus', 
        'plane', 'text', 'image', 'group', 'light'
      ]).describe('Object type'),
      name: z.string().min(1).describe('Object name'),
      position: z.object({
        x: z.number().default(0).describe('X position'),
        y: z.number().default(0).describe('Y position'),
        z: z.number().default(0).describe('Z position'),
      }).optional().describe('Object position'),
      rotation: z.object({
        x: z.number().default(0).describe('X rotation (degrees)'),
        y: z.number().default(0).describe('Y rotation (degrees)'),
        z: z.number().default(0).describe('Z rotation (degrees)'),
      }).optional().describe('Object rotation'),
      scale: z.object({
        x: z.number().default(1).describe('X scale'),
        y: z.number().default(1).describe('Y scale'),
        z: z.number().default(1).describe('Z scale'),
      }).optional().describe('Object scale'),
      color: z.string().optional().describe('Object color (hex)'),
      properties: z.record(z.any()).optional().describe('Additional properties'),
    },
    async ({ sceneId, type, name, position, rotation, scale, color, properties }) => {
      try {
        const objectData = {
          type,
          name,
          position: position || { x: 0, y: 0, z: 0 },
          rotation: rotation || { x: 0, y: 0, z: 0 },
          scale: scale || { x: 1, y: 1, z: 1 },
          ...(color && { color }),
          ...(properties && { properties }),
        };
        
        const result = await apiClient.createObject(sceneId, objectData);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Object created successfully with ID: ${result.id}` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error creating object: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Update an existing object
  server.tool(
    'updateObject',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      objectId: z.string().min(1).describe('Object ID'),
      position: z.object({
        x: z.number().optional().describe('X position'),
        y: z.number().optional().describe('Y position'),
        z: z.number().optional().describe('Z position'),
      }).optional().describe('Object position'),
      rotation: z.object({
        x: z.number().optional().describe('X rotation (degrees)'),
        y: z.number().optional().describe('Y rotation (degrees)'),
        z: z.number().optional().describe('Z rotation (degrees)'),
      }).optional().describe('Object rotation'),
      scale: z.object({
        x: z.number().optional().describe('X scale'),
        y: z.number().optional().describe('Y scale'),
        z: z.number().optional().describe('Z scale'),
      }).optional().describe('Object scale'),
      color: z.string().optional().describe('Object color (hex)'),
      visible: z.boolean().optional().describe('Object visibility'),
      properties: z.record(z.any()).optional().describe('Additional properties'),
    },
    async ({ sceneId, objectId, position, rotation, scale, color, visible, properties }) => {
      try {
        const updateData = {
          ...(position && { position }),
          ...(rotation && { rotation }),
          ...(scale && { scale }),
          ...(color && { color }),
          ...(visible !== undefined && { visible }),
          ...(properties && { properties }),
        };
        
        await apiClient.updateObject(sceneId, objectId, updateData);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Object ${objectId} updated successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error updating object: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Delete an object
  server.tool(
    'deleteObject',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      objectId: z.string().min(1).describe('Object ID'),
    },
    async ({ sceneId, objectId }) => {
      try {
        await apiClient.deleteObject(sceneId, objectId);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Object ${objectId} deleted successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error deleting object: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Generate runtime code for object interaction
  server.tool(
    'generateObjectCode',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      objectId: z.string().min(1).describe('Object ID'),
      action: z.enum(['move', 'rotate', 'scale', 'color', 'visibility', 'emitEvent'])
        .describe('Action to perform on the object'),
      params: z.record(z.any()).optional().describe('Action parameters'),
    },
    async ({ sceneId, objectId, action, params }) => {
      try {
        const code = runtimeManager.generateObjectInteractionCode(
          sceneId, 
          objectId, 
          action, 
          params || {}
        );
        
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
