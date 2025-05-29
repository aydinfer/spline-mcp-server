import { z } from 'zod';
import apiClient from '../utils/api-client.js';

/**
 * Material management tools for Spline.design
 * @param {object} server - MCP server instance
 */
export const registerMaterialTools = (server) => {
  // Get all materials in a scene
  server.tool(
    'getMaterials',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
    },
    async ({ sceneId }) => {
      try {
        const materials = await apiClient.getMaterials(sceneId);
        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(materials, null, 2) 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error retrieving materials: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Get details of a specific material
  server.tool(
    'getMaterialDetails',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      materialId: z.string().min(1).describe('Material ID'),
    },
    async ({ sceneId, materialId }) => {
      try {
        const material = await apiClient.getMaterial(sceneId, materialId);
        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(material, null, 2) 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error retrieving material details: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Create a new material
  server.tool(
    'createMaterial',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      name: z.string().min(1).describe('Material name'),
      type: z.enum([
        'standard', 
        'physical', 
        'basic', 
        'lambert', 
        'phong', 
        'toon', 
        'matcap', 
        'normal'
      ]).describe('Material type'),
      color: z.string().optional().describe('Base color (hex)'),
      roughness: z.number().min(0).max(1).optional().describe('Surface roughness (0-1)'),
      metalness: z.number().min(0).max(1).optional().describe('Metalness factor (0-1)'),
      opacity: z.number().min(0).max(1).optional().describe('Opacity (0-1)'),
      transparent: z.boolean().optional().describe('Whether the material is transparent'),
      wireframe: z.boolean().optional().describe('Whether to render as wireframe'),
      emissive: z.string().optional().describe('Emissive color (hex)'),
      emissiveIntensity: z.number().min(0).optional().describe('Intensity of emission'),
      side: z.enum(['front', 'back', 'double']).optional().describe('Which side to render'),
      flatShading: z.boolean().optional().describe('Use flat shading'),
      properties: z.record(z.any()).optional().describe('Additional properties'),
    },
    async ({ 
      sceneId, 
      name, 
      type, 
      color, 
      roughness, 
      metalness, 
      opacity, 
      transparent, 
      wireframe, 
      emissive, 
      emissiveIntensity, 
      side, 
      flatShading, 
      properties 
    }) => {
      try {
        const materialData = {
          name,
          type,
          ...(color && { color }),
          ...(roughness !== undefined && { roughness }),
          ...(metalness !== undefined && { metalness }),
          ...(opacity !== undefined && { opacity }),
          ...(transparent !== undefined && { transparent }),
          ...(wireframe !== undefined && { wireframe }),
          ...(emissive && { emissive }),
          ...(emissiveIntensity !== undefined && { emissiveIntensity }),
          ...(side && { side }),
          ...(flatShading !== undefined && { flatShading }),
          ...(properties && { properties }),
        };
        
        const result = await apiClient.request('POST', `/scenes/${sceneId}/materials`, materialData);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Material created successfully with ID: ${result.id}` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error creating material: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Update an existing material
  server.tool(
    'updateMaterial',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      materialId: z.string().min(1).describe('Material ID'),
      color: z.string().optional().describe('Base color (hex)'),
      roughness: z.number().min(0).max(1).optional().describe('Surface roughness (0-1)'),
      metalness: z.number().min(0).max(1).optional().describe('Metalness factor (0-1)'),
      opacity: z.number().min(0).max(1).optional().describe('Opacity (0-1)'),
      transparent: z.boolean().optional().describe('Whether the material is transparent'),
      wireframe: z.boolean().optional().describe('Whether to render as wireframe'),
      emissive: z.string().optional().describe('Emissive color (hex)'),
      emissiveIntensity: z.number().min(0).optional().describe('Intensity of emission'),
      side: z.enum(['front', 'back', 'double']).optional().describe('Which side to render'),
      flatShading: z.boolean().optional().describe('Use flat shading'),
      properties: z.record(z.any()).optional().describe('Additional properties'),
    },
    async ({ 
      sceneId, 
      materialId, 
      color, 
      roughness, 
      metalness, 
      opacity, 
      transparent, 
      wireframe, 
      emissive, 
      emissiveIntensity, 
      side, 
      flatShading, 
      properties 
    }) => {
      try {
        const updateData = {
          ...(color && { color }),
          ...(roughness !== undefined && { roughness }),
          ...(metalness !== undefined && { metalness }),
          ...(opacity !== undefined && { opacity }),
          ...(transparent !== undefined && { transparent }),
          ...(wireframe !== undefined && { wireframe }),
          ...(emissive && { emissive }),
          ...(emissiveIntensity !== undefined && { emissiveIntensity }),
          ...(side && { side }),
          ...(flatShading !== undefined && { flatShading }),
          ...(properties && { properties }),
        };
        
        await apiClient.updateMaterial(sceneId, materialId, updateData);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Material ${materialId} updated successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error updating material: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Apply a material to an object
  server.tool(
    'applyMaterial',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      objectId: z.string().min(1).describe('Object ID'),
      materialId: z.string().min(1).describe('Material ID'),
    },
    async ({ sceneId, objectId, materialId }) => {
      try {
        await apiClient.request('POST', `/scenes/${sceneId}/objects/${objectId}/material`, {
          materialId
        });
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Material ${materialId} applied to object ${objectId} successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error applying material: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );
};
