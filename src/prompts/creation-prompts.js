import { z } from 'zod';

/**
 * Prompts for creating objects and materials in Spline.design
 * @param {object} server - MCP server instance
 */
export const registerCreationPrompts = (server) => {
  // Create a cube prompt
  server.prompt(
    'create-cube',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      name: z.string().optional().default('New Cube').describe('Cube name'),
      size: z.number().optional().default(1).describe('Cube size'),
      color: z.string().optional().default('#ffffff').describe('Cube color (hex)'),
      position: z.object({
        x: z.number().default(0).describe('X position'),
        y: z.number().default(0).describe('Y position'),
        z: z.number().default(0).describe('Z position'),
      }).optional().describe('Cube position'),
    },
    ({ sceneId, name, size, color, position }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Create a cube in scene ${sceneId} with these properties:
- Name: ${name}
- Size: ${size}
- Color: ${color}
- Position: ${JSON.stringify(position || { x: 0, y: 0, z: 0 })}

Use the createObject tool to create a cube with these properties. Set the scale to ${size} for all three dimensions.`
        }
      }]
    })
  );

  // Create a basic scene prompt
  server.prompt(
    'create-basic-scene',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      objects: z.array(z.object({
        type: z.enum(['cube', 'sphere', 'cylinder', 'plane']).describe('Object type'),
        name: z.string().describe('Object name'),
        position: z.object({
          x: z.number().describe('X position'),
          y: z.number().describe('Y position'),
          z: z.number().describe('Z position'),
        }).describe('Object position'),
        color: z.string().optional().describe('Object color (hex)'),
      })).min(1).describe('Objects to create'),
      includeLight: z.boolean().default(true).describe('Whether to include a directional light'),
    },
    ({ sceneId, objects, includeLight }) => {
      let objectsList = '';
      objects.forEach((obj, index) => {
        objectsList += `
Object ${index + 1}:
- Type: ${obj.type}
- Name: ${obj.name}
- Position: ${JSON.stringify(obj.position)}
- Color: ${obj.color || '#ffffff'}
`;
      });

      return {
        messages: [{
          role: 'user',
          content: {
            type: 'text',
            text: `Create a basic scene in Spline with these objects in scene ${sceneId}:
${objectsList}
${includeLight ? 'Also create a directional light to illuminate the scene.' : ''}

Use the createObject tool to create each object one by one with the specified properties.`
          }
        }]
      };
    }
  );

  // Create material and apply to object prompt
  server.prompt(
    'create-apply-material',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      objectId: z.string().min(1).describe('Object ID'),
      materialType: z.enum(['standard', 'physical', 'basic', 'lambert', 'phong'])
        .default('physical').describe('Material type'),
      materialName: z.string().optional().default('New Material').describe('Material name'),
      color: z.string().optional().default('#ffffff').describe('Material color (hex)'),
      roughness: z.number().min(0).max(1).optional().default(0.5).describe('Roughness (0-1)'),
      metalness: z.number().min(0).max(1).optional().default(0).describe('Metalness (0-1)'),
    },
    ({ sceneId, objectId, materialType, materialName, color, roughness, metalness }) => ({
      messages: [{
        role: 'user',
        content: {
          type: 'text',
          text: `Create a new ${materialType} material in scene ${sceneId} with these properties:
- Name: ${materialName}
- Color: ${color}
- Roughness: ${roughness}
- Metalness: ${metalness}

Then apply this material to the object with ID ${objectId}.

First, use the createMaterial tool to create the material with the specified properties, then use the applyMaterial tool to apply it to the object.`
        }
      }]
    })
  );
};
