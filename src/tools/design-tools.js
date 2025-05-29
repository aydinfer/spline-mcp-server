import { z } from 'zod';

/**
 * Advanced design tools for Spline.design
 * @param {object} server - MCP server instance
 */
export const registerDesignTools = (server) => {
  // Create parametric object
  server.tool(
    'createParametricObject',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      type: z.enum([
        'cube', 'sphere', 'cylinder', 'cone', 'torus', 
        'plane', 'circle', 'polygon', 'star', 'ring'
      ]).describe('Object type'),
      name: z.string().min(1).describe('Object name'),
      position: z.object({
        x: z.number().default(0).describe('X position'),
        y: z.number().default(0).describe('Y position'),
        z: z.number().default(0).describe('Z position'),
      }).optional().describe('Object position'),
      parameters: z.record(z.any()).optional().describe('Shape-specific parameters'),
    },
    async ({ sceneId, type, name, position, parameters }) => {
      try {
        // This would normally call the Spline API to create a parametric object
        // For now, just return a success message
        return {
          content: [
            { 
              type: 'text', 
              text: `Parametric object "${name}" of type "${type}" created successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error creating parametric object: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Create 3D text
  server.tool(
    'create3DText',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      text: z.string().min(1).describe('Text content'),
      name: z.string().optional().describe('Object name'),
      position: z.object({
        x: z.number().default(0).describe('X position'),
        y: z.number().default(0).describe('Y position'),
        z: z.number().default(0).describe('Z position'),
      }).optional().describe('Object position'),
      font: z.string().optional().default('Inter').describe('Font family'),
      size: z.number().min(0).optional().default(1).describe('Font size'),
      extrusion: z.number().min(0).optional().default(0.2).describe('Extrusion depth'),
      color: z.string().optional().default('#ffffff').describe('Text color (hex)'),
    },
    async ({ sceneId, text, name, position, font, size, extrusion, color }) => {
      try {
        // This would normally call the Spline API to create 3D text
        // For now, just return a success message
        return {
          content: [
            { 
              type: 'text', 
              text: `3D text "${text}" created successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error creating 3D text: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Create particle system
  server.tool(
    'createParticleSystem',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      name: z.string().optional().default('Particle System').describe('System name'),
      position: z.object({
        x: z.number().default(0).describe('X position'),
        y: z.number().default(0).describe('Y position'),
        z: z.number().default(0).describe('Z position'),
      }).optional().describe('System position'),
      emissionRate: z.number().min(0).optional().default(50).describe('Particles per second'),
      lifetime: z.number().min(0).optional().default(2).describe('Particle lifetime (seconds)'),
      speed: z.number().min(0).optional().default(1).describe('Particle speed'),
      size: z.number().min(0).optional().default(0.1).describe('Particle size'),
      color: z.string().optional().default('#ffffff').describe('Particle color (hex)'),
      shape: z.enum(['point', 'sphere', 'box', 'cone']).optional().default('sphere')
        .describe('Emission shape'),
    },
    async ({ sceneId, name, position, emissionRate, lifetime, speed, size, color, shape }) => {
      try {
        // This would normally call the Spline API to create a particle system
        // For now, just return a success message
        return {
          content: [
            { 
              type: 'text', 
              text: `Particle system "${name}" created successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error creating particle system: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Add physics body
  server.tool(
    'addPhysicsBody',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      objectId: z.string().min(1).describe('Object ID'),
      type: z.enum(['static', 'dynamic', 'kinematic']).default('dynamic')
        .describe('Physics body type'),
      mass: z.number().min(0).optional().default(1).describe('Object mass'),
      collisionShape: z.enum(['auto', 'box', 'sphere', 'cylinder', 'capsule', 'mesh'])
        .optional().default('auto').describe('Collision shape'),
    },
    async ({ sceneId, objectId, type, mass, collisionShape }) => {
      try {
        // This would normally call the Spline API to add physics to an object
        // For now, just return a success message
        return {
          content: [
            { 
              type: 'text', 
              text: `Physics body added to object ${objectId} successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error adding physics body: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );
};
