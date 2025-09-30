import apiClient from '../utils/api-client.js';

/**
 * Material resources for Spline.design
 * @param {object} server - MCP server instance
 */
export const registerMaterialResources = (server) => {
  // Material resource
  server.resource(
    'spline://scene/{sceneId}/material/{materialId}',
    async (uri) => {
      const parts = uri.pathname.split('/');
      const sceneId = parts[2];
      const materialId = parts[4];
      try {
        const material = await apiClient.getMaterial(sceneId, materialId);
        
        return {
          contents: [{
            uri: uri.href,
            text: `# Spline Material: ${material.name}\n\n` +
                  `## Material Details\n\n` +
                  `- ID: ${material.id}\n` +
                  `- Name: ${material.name}\n` +
                  `- Type: ${material.type || 'N/A'}\n` +
                  `- Color: ${material.color || 'N/A'}\n\n` +
                  `## Properties\n\n` +
                  `- Roughness: ${material.roughness !== undefined ? material.roughness : 'N/A'}\n` +
                  `- Metalness: ${material.metalness !== undefined ? material.metalness : 'N/A'}\n` +
                  `- Opacity: ${material.opacity !== undefined ? material.opacity : 'N/A'}\n` +
                  `- Transparent: ${material.transparent ? 'Yes' : 'No'}\n` +
                  `- Wireframe: ${material.wireframe ? 'Yes' : 'No'}\n` +
                  `- Emissive: ${material.emissive || 'N/A'}\n` +
                  `- Emissive Intensity: ${material.emissiveIntensity !== undefined ? material.emissiveIntensity : 'N/A'}\n` +
                  `- Side: ${material.side || 'N/A'}\n` +
                  `- Flat Shading: ${material.flatShading ? 'Yes' : 'No'}`
          }]
        };
      } catch (error) {
        return {
          contents: [{
            uri: uri.href,
            text: `Error retrieving material information: ${error.message}`
          }]
        };
      }
    }
  );

  // List materials resource
  server.resource(
    'spline://scene/{sceneId}/materials',
    async (uri) => {
      const sceneId = uri.pathname.split('/')[2];
      try {
        const materials = await apiClient.getMaterials(sceneId);
        
        let text = `# Materials in Scene (ID: ${sceneId})\n\n`;
        
        if (materials.length === 0) {
          text += 'No materials available in this scene.';
        } else {
          materials.forEach(material => {
            text += `## ${material.name}\n\n` +
                    `- ID: ${material.id}\n` +
                    `- Type: ${material.type || 'N/A'}\n` +
                    `- Color: ${material.color || 'N/A'}\n` +
                    `- Resource URI: spline://scene/${sceneId}/material/${material.id}\n\n`;
          });
        }
        
        return {
          contents: [{
            uri: uri.href,
            text
          }]
        };
      } catch (error) {
        return {
          contents: [{
            uri: uri.href,
            text: `Error retrieving materials: ${error.message}`
          }]
        };
      }
    }
  );
};
