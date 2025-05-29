import { z } from 'zod';

/**
 * Lighting and Camera tools for Spline.design
 * @param {object} server - MCP server instance
 */
export const registerLightingCameraTools = (server) => {
  // Add directional light
  server.tool(
    'addDirectionalLight',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      name: z.string().optional().default('Directional Light').describe('Light name'),
      position: z.object({
        x: z.number().default(0).describe('X position'),
        y: z.number().default(10).describe('Y position'),
        z: z.number().default(0).describe('Z position'),
      }).optional().describe('Light position'),
      color: z.string().optional().default('#ffffff').describe('Light color (hex)'),
      intensity: z.number().min(0).optional().default(1).describe('Light intensity'),
      castShadow: z.boolean().optional().default(true).describe('Whether to cast shadows'),
    },
    async ({ sceneId, name, position, color, intensity, castShadow }) => {
      try {
        // This would normally call the Spline API to create a light
        // For now, just return a success message
        return {
          content: [
            { 
              type: 'text', 
              text: `Directional light "${name}" created successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error creating directional light: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Add camera
  server.tool(
    'addCamera',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      name: z.string().optional().default('Camera').describe('Camera name'),
      position: z.object({
        x: z.number().default(0).describe('X position'),
        y: z.number().default(0).describe('Y position'),
        z: z.number().default(5).describe('Z position'),
      }).optional().describe('Camera position'),
      target: z.object({
        x: z.number().default(0).describe('X target'),
        y: z.number().default(0).describe('Y target'),
        z: z.number().default(0).describe('Z target'),
      }).optional().describe('Camera target'),
      type: z.enum(['perspective', 'orthographic']).optional().default('perspective')
        .describe('Camera type'),
      fov: z.number().min(1).max(179).optional().default(45).describe('Field of view (degrees)'),
    },
    async ({ sceneId, name, position, target, type, fov }) => {
      try {
        // This would normally call the Spline API to create a camera
        // For now, just return a success message
        return {
          content: [
            { 
              type: 'text', 
              text: `Camera "${name}" created successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error creating camera: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Configure fog
  server.tool(
    'configureFog',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      enabled: z.boolean().default(true).describe('Whether fog is enabled'),
      color: z.string().optional().default('#cccccc').describe('Fog color (hex)'),
      density: z.number().min(0).max(1).optional().default(0.1).describe('Fog density'),
      near: z.number().min(0).optional().default(1).describe('Near distance'),
      far: z.number().min(0).optional().default(100).describe('Far distance'),
    },
    async ({ sceneId, enabled, color, density, near, far }) => {
      try {
        // This would normally call the Spline API to configure fog
        // For now, just return a success message
        return {
          content: [
            { 
              type: 'text', 
              text: `Fog ${enabled ? 'enabled' : 'disabled'} successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring fog: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Configure post-processing
  server.tool(
    'configurePostProcessing',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      bloom: z.object({
        enabled: z.boolean().default(false).describe('Enable bloom effect'),
        intensity: z.number().min(0).max(1).optional().default(0.5).describe('Bloom intensity'),
      }).optional().describe('Bloom effect settings'),
      depthOfField: z.object({
        enabled: z.boolean().default(false).describe('Enable depth of field'),
        focusDistance: z.number().min(0).optional().default(10).describe('Focus distance'),
        focalLength: z.number().min(0).optional().default(50).describe('Focal length'),
        bokehScale: z.number().min(0).optional().default(2).describe('Bokeh scale'),
      }).optional().describe('Depth of field settings'),
    },
    async ({ sceneId, bloom, depthOfField }) => {
      try {
        // This would normally call the Spline API to configure post-processing
        // For now, just return a success message
        return {
          content: [
            { 
              type: 'text', 
              text: `Post-processing effects configured successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring post-processing: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );
};
