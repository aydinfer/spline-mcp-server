import { z } from 'zod';
import apiClient from '../utils/api-client.js';
import runtimeManager from '../utils/runtime-manager.js';

/**
 * Scene management tools for Spline.design
 * @param {object} server - MCP server instance
 */
export const registerSceneTools = (server) => {
  // Get scene details
  server.tool(
    'getScene',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
    },
    async ({ sceneId }) => {
      try {
        const scene = await apiClient.getScene(sceneId);
        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(scene, null, 2) 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error retrieving scene: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Get available scenes
  server.tool(
    'getScenes',
    {
      projectId: z.string().min(1).optional().describe('Project ID (optional)'),
      limit: z.number().int().min(1).max(100).default(10)
        .describe('Maximum number of scenes to retrieve'),
      offset: z.number().int().min(0).default(0).describe('Pagination offset'),
    },
    async ({ projectId, limit, offset }) => {
      try {
        const params = {
          limit,
          offset,
          ...(projectId && { projectId }),
        };
        
        const scenes = await apiClient.request('GET', '/scenes', params);
        
        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(scenes, null, 2) 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error retrieving scenes: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Export scene as code
  server.tool(
    'exportSceneCode',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      format: z.enum(['vanilla', 'react', 'next']).default('vanilla')
        .describe('Export format'),
    },
    async ({ sceneId, format }) => {
      try {
        const code = runtimeManager.generateRuntimeCode(sceneId, format);
        
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

  // Generate embed code for a scene
  server.tool(
    'generateEmbedCode',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      width: z.string().default('100%').describe('Iframe width'),
      height: z.string().default('100%').describe('Iframe height'),
      frameBorder: z.string().default('0').describe('Iframe border'),
    },
    async ({ sceneId, width, height, frameBorder }) => {
      try {
        const embedUrl = `https://my.spline.design/${sceneId}/`;
        const embedCode = `<iframe src='${embedUrl}' frameborder='${frameBorder}' width='${width}' height='${height}'></iframe>`;
        
        return {
          content: [
            { 
              type: 'text', 
              text: embedCode 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error generating embed code: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Get variable value
  server.tool(
    'getVariable',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      variableName: z.string().min(1).describe('Variable name'),
    },
    async ({ sceneId, variableName }) => {
      try {
        const variables = await apiClient.request('GET', `/scenes/${sceneId}/variables`);
        const variable = variables.find(v => v.name === variableName);
        
        if (!variable) {
          return {
            content: [
              { 
                type: 'text', 
                text: `Variable "${variableName}" not found` 
              }
            ],
            isError: true
          };
        }
        
        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(variable, null, 2) 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error retrieving variable: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Set variable value
  server.tool(
    'setVariable',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      variableName: z.string().min(1).describe('Variable name'),
      value: z.any().describe('Variable value'),
      variableType: z.enum(['string', 'number', 'boolean']).describe('Variable type'),
    },
    async ({ sceneId, variableName, value, variableType }) => {
      try {
        // Convert value based on specified type
        let typedValue = value;
        if (variableType === 'number') {
          typedValue = Number(value);
        } else if (variableType === 'boolean') {
          typedValue = Boolean(value);
        } else {
          typedValue = String(value);
        }
        
        await apiClient.request('PUT', `/scenes/${sceneId}/variables/${variableName}`, {
          value: typedValue,
          type: variableType
        });
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Variable "${variableName}" set to ${JSON.stringify(typedValue)}` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error setting variable: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Generate variable manipulation code
  server.tool(
    'generateVariableCode',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      variableName: z.string().min(1).describe('Variable name'),
      value: z.any().describe('Variable value'),
    },
    async ({ sceneId, variableName, value }) => {
      try {
        const code = runtimeManager.generateVariableCode(sceneId, variableName, value);
        
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
