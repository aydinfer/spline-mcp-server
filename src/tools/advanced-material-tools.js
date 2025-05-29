import { z } from 'zod';
import apiClient from '../utils/api-client.js';

/**
 * Advanced material & shading tools for Spline.design
 * @param {object} server - MCP server instance
 */
export const registerAdvancedMaterialTools = (server) => {
  // Create a material with layers
  server.tool(
    'createLayeredMaterial',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      name: z.string().min(1).describe('Material name'),
      baseType: z.enum(['standard', 'physical', 'basic', 'lambert', 'phong'])
        .default('physical').describe('Base material type'),
      layers: z.array(z.object({
        type: z.enum([
          'color', 'lighting', 'image', 'video', 'depth', 'normal', 
          'gradient', 'noise', 'fresnel', 'rainbow', 'toon', 
          'outline', 'glass', 'matcap', 'displace', 'pattern'
        ]).describe('Layer type'),
        name: z.string().describe('Layer name'),
        params: z.record(z.any()).optional().describe('Layer-specific parameters'),
        blendMode: z.enum([
          'normal', 'multiply', 'screen', 'overlay', 'darken', 
          'lighten', 'colorDodge', 'colorBurn', 'hardLight', 
          'softLight', 'difference', 'exclusion', 'hue', 
          'saturation', 'color', 'luminosity'
        ]).optional().default('normal').describe('Layer blend mode'),
        opacity: z.number().min(0).max(1).optional().default(1).describe('Layer opacity'),
        maskLayer: z.number().optional().describe('Index of layer to use as mask'),
      })).min(1).describe('Material layers'),
      baseParams: z.object({
        roughness: z.number().min(0).max(1).optional().describe('Base roughness'),
        metalness: z.number().min(0).max(1).optional().describe('Base metalness'),
        opacity: z.number().min(0).max(1).optional().describe('Base opacity'),
        transparent: z.boolean().optional().describe('Whether material is transparent'),
        side: z.enum(['front', 'back', 'double']).optional().describe('Which sides to render'),
        wireframe: z.boolean().optional().describe('Whether to render as wireframe'),
        flatShading: z.boolean().optional().describe('Whether to use flat shading'),
      }).optional().describe('Base material parameters'),
    },
    async ({ sceneId, name, baseType, layers, baseParams }) => {
      try {
        const materialData = {
          name,
          type: baseType,
          ...(baseParams && baseParams),
          layers: layers.map(layer => ({
            type: layer.type,
            name: layer.name,
            ...(layer.params && { params: layer.params }),
            blendMode: layer.blendMode || 'normal',
            opacity: layer.opacity || 1,
            ...(layer.maskLayer !== undefined && { maskLayer: layer.maskLayer }),
          })),
        };
        
        const result = await apiClient.request('POST', `/scenes/${sceneId}/materials`, materialData);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Layered material "${name}" created successfully with ID: ${result.id}` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error creating layered material: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Add layer to existing material
  server.tool(
    'addMaterialLayer',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      materialId: z.string().min(1).describe('Material ID'),
      layerType: z.enum([
        'color', 'lighting', 'image', 'video', 'depth', 'normal', 
        'gradient', 'noise', 'fresnel', 'rainbow', 'toon', 
        'outline', 'glass', 'matcap', 'displace', 'pattern'
      ]).describe('Layer type'),
      name: z.string().min(1).describe('Layer name'),
      params: z.record(z.any()).optional().describe('Layer-specific parameters'),
      blendMode: z.enum([
        'normal', 'multiply', 'screen', 'overlay', 'darken', 
        'lighten', 'colorDodge', 'colorBurn', 'hardLight', 
        'softLight', 'difference', 'exclusion', 'hue', 
        'saturation', 'color', 'luminosity'
      ]).optional().default('normal').describe('Layer blend mode'),
      opacity: z.number().min(0).max(1).optional().default(1).describe('Layer opacity'),
      maskLayer: z.number().optional().describe('Index of layer to use as mask'),
      position: z.number().int().optional().describe('Position in layer stack (0 = bottom)'),
    },
    async ({ 
      sceneId, 
      materialId, 
      layerType, 
      name, 
      params, 
      blendMode, 
      opacity, 
      maskLayer, 
      position 
    }) => {
      try {
        const layerData = {
          type: layerType,
          name,
          ...(params && { params }),
          blendMode: blendMode || 'normal',
          opacity: opacity || 1,
          ...(maskLayer !== undefined && { maskLayer }),
          ...(position !== undefined && { position }),
        };
        
        const result = await apiClient.request('POST', `/scenes/${sceneId}/materials/${materialId}/layers`, layerData);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Layer "${name}" added successfully to material ${materialId}` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error adding material layer: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Configure color layer
  server.tool(
    'configureColorLayer',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      materialId: z.string().min(1).describe('Material ID'),
      layerId: z.string().min(1).describe('Layer ID'),
      color: z.string().describe('Color value (hex, rgb, or rgba)'),
      intensity: z.number().min(0).optional().default(1).describe('Color intensity'),
    },
    async ({ sceneId, materialId, layerId, color, intensity }) => {
      try {
        const layerParams = {
          color,
          ...(intensity !== undefined && { intensity }),
        };
        
        await apiClient.request('PUT', `/scenes/${sceneId}/materials/${materialId}/layers/${layerId}`, {
          params: layerParams
        });
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Color layer ${layerId} configured successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring color layer: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Configure image layer
  server.tool(
    'configureImageLayer',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      materialId: z.string().min(1).describe('Material ID'),
      layerId: z.string().min(1).describe('Layer ID'),
      imageUrl: z.string().url().describe('URL to image'),
      tiling: z.object({
        x: z.number().min(0).default(1).describe('X tiling'),
        y: z.number().min(0).default(1).describe('Y tiling'),
      }).optional().describe('Image tiling'),
      offset: z.object({
        x: z.number().default(0).describe('X offset'),
        y: z.number().default(0).describe('Y offset'),
      }).optional().describe('Image offset'),
      rotation: z.number().default(0).describe('Rotation in degrees'),
    },
    async ({ sceneId, materialId, layerId, imageUrl, tiling, offset, rotation }) => {
      try {
        const layerParams = {
          imageUrl,
          ...(tiling && { tiling }),
          ...(offset && { offset }),
          ...(rotation !== undefined && { rotation }),
        };
        
        await apiClient.request('PUT', `/scenes/${sceneId}/materials/${materialId}/layers/${layerId}`, {
          params: layerParams
        });
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Image layer ${layerId} configured successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring image layer: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Configure gradient layer
  server.tool(
    'configureGradientLayer',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      materialId: z.string().min(1).describe('Material ID'),
      layerId: z.string().min(1).describe('Layer ID'),
      gradientType: z.enum(['linear', 'radial', 'angular']).describe('Gradient type'),
      colors: z.array(z.object({
        color: z.string().describe('Color value (hex, rgb, or rgba)'),
        position: z.number().min(0).max(1).describe('Position in gradient (0-1)'),
      })).min(2).describe('Gradient colors'),
      rotation: z.number().optional().default(0).describe('Rotation in degrees'),
      scale: z.number().optional().default(1).describe('Gradient scale'),
    },
    async ({ sceneId, materialId, layerId, gradientType, colors, rotation, scale }) => {
      try {
        const layerParams = {
          gradientType,
          colors,
          ...(rotation !== undefined && { rotation }),
          ...(scale !== undefined && { scale }),
        };
        
        await apiClient.request('PUT', `/scenes/${sceneId}/materials/${materialId}/layers/${layerId}`, {
          params: layerParams
        });
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Gradient layer ${layerId} configured successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring gradient layer: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Configure normal layer
  server.tool(
    'configureNormalLayer',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      materialId: z.string().min(1).describe('Material ID'),
      layerId: z.string().min(1).describe('Layer ID'),
      normalMapUrl: z.string().url().describe('URL to normal map image'),
      intensity: z.number().min(0).optional().default(1).describe('Normal map intensity'),
      tiling: z.object({
        x: z.number().min(0).default(1).describe('X tiling'),
        y: z.number().min(0).default(1).describe('Y tiling'),
      }).optional().describe('Normal map tiling'),
    },
    async ({ sceneId, materialId, layerId, normalMapUrl, intensity, tiling }) => {
      try {
        const layerParams = {
          normalMapUrl,
          ...(intensity !== undefined && { intensity }),
          ...(tiling && { tiling }),
        };
        
        await apiClient.request('PUT', `/scenes/${sceneId}/materials/${materialId}/layers/${layerId}`, {
          params: layerParams
        });
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Normal layer ${layerId} configured successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring normal layer: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Configure fresnel layer
  server.tool(
    'configureFresnelLayer',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      materialId: z.string().min(1).describe('Material ID'),
      layerId: z.string().min(1).describe('Layer ID'),
      color: z.string().describe('Fresnel color (hex, rgb, or rgba)'),
      power: z.number().min(0).optional().default(2).describe('Fresnel power'),
      bias: z.number().min(0).max(1).optional().default(0).describe('Fresnel bias'),
      intensity: z.number().min(0).optional().default(1).describe('Fresnel intensity'),
    },
    async ({ sceneId, materialId, layerId, color, power, bias, intensity }) => {
      try {
        const layerParams = {
          color,
          ...(power !== undefined && { power }),
          ...(bias !== undefined && { bias }),
          ...(intensity !== undefined && { intensity }),
        };
        
        await apiClient.request('PUT', `/scenes/${sceneId}/materials/${materialId}/layers/${layerId}`, {
          params: layerParams
        });
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Fresnel layer ${layerId} configured successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring fresnel layer: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Configure glass layer
  server.tool(
    'configureGlassLayer',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      materialId: z.string().min(1).describe('Material ID'),
      layerId: z.string().min(1).describe('Layer ID'),
      tint: z.string().optional().describe('Glass tint color (hex, rgb, or rgba)'),
      ior: z.number().min(1).optional().default(1.5).describe('Index of refraction'),
      roughness: z.number().min(0).max(1).optional().default(0).describe('Glass roughness'),
      thickness: z.number().min(0).optional().default(0.1).describe('Glass thickness'),
    },
    async ({ sceneId, materialId, layerId, tint, ior, roughness, thickness }) => {
      try {
        const layerParams = {
          ...(tint && { tint }),
          ...(ior !== undefined && { ior }),
          ...(roughness !== undefined && { roughness }),
          ...(thickness !== undefined && { thickness }),
        };
        
        await apiClient.request('PUT', `/scenes/${sceneId}/materials/${materialId}/layers/${layerId}`, {
          params: layerParams
        });
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Glass layer ${layerId} configured successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring glass layer: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Configure matcap layer
  server.tool(
    'configureMatcapLayer',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      materialId: z.string().min(1).describe('Material ID'),
      layerId: z.string().min(1).describe('Layer ID'),
      matcapImageUrl: z.string().url().describe('URL to matcap image'),
      intensity: z.number().min(0).optional().default(1).describe('Matcap intensity'),
    },
    async ({ sceneId, materialId, layerId, matcapImageUrl, intensity }) => {
      try {
        const layerParams = {
          matcapImageUrl,
          ...(intensity !== undefined && { intensity }),
        };
        
        await apiClient.request('PUT', `/scenes/${sceneId}/materials/${materialId}/layers/${layerId}`, {
          params: layerParams
        });
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Matcap layer ${layerId} configured successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error configuring matcap layer: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // List material layers
  server.tool(
    'listMaterialLayers',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      materialId: z.string().min(1).describe('Material ID'),
    },
    async ({ sceneId, materialId }) => {
      try {
        const layers = await apiClient.request('GET', `/scenes/${sceneId}/materials/${materialId}/layers`);
        
        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(layers, null, 2) 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error listing material layers: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Delete material layer
  server.tool(
    'deleteMaterialLayer',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      materialId: z.string().min(1).describe('Material ID'),
      layerId: z.string().min(1).describe('Layer ID'),
    },
    async ({ sceneId, materialId, layerId }) => {
      try {
        await apiClient.request('DELETE', `/scenes/${sceneId}/materials/${materialId}/layers/${layerId}`);
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Layer ${layerId} deleted successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error deleting material layer: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );

  // Reorder material layers
  server.tool(
    'reorderMaterialLayers',
    {
      sceneId: z.string().min(1).describe('Scene ID'),
      materialId: z.string().min(1).describe('Material ID'),
      layerOrder: z.array(z.string()).min(1).describe('New layer order (array of layer IDs)'),
    },
    async ({ sceneId, materialId, layerOrder }) => {
      try {
        await apiClient.request('PUT', `/scenes/${sceneId}/materials/${materialId}/layers/order`, {
          layerOrder
        });
        
        return {
          content: [
            { 
              type: 'text', 
              text: `Material layers reordered successfully` 
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            { 
              type: 'text', 
              text: `Error reordering material layers: ${error.message}` 
            }
          ],
          isError: true
        };
      }
    }
  );
};
