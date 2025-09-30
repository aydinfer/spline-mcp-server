import apiClient from '../utils/api-client.js';

/**
 * Scene and object resources for Spline.design
 * @param {object} server - MCP server instance
 */
export const registerSceneResources = (server) => {
  // Scene resource
  server.resource(
    'spline://scene/{sceneId}',
    async (uri) => {
      const sceneId = uri.pathname.split('/').pop();
      try {
        const scene = await apiClient.getScene(sceneId);
        
        return {
          contents: [{
            uri: uri.href,
            text: `# Spline Scene: ${scene.name}\n\n` +
                  `## Scene Details\n\n` +
                  `- ID: ${scene.id}\n` +
                  `- Name: ${scene.name}\n` +
                  `- Description: ${scene.description || 'N/A'}\n` +
                  `- Created: ${new Date(scene.createdAt).toLocaleString()}\n` +
                  `- Last Updated: ${new Date(scene.updatedAt).toLocaleString()}\n\n` +
                  `## Scene Statistics\n\n` +
                  `- Objects: ${scene.objectCount || 'N/A'}\n` +
                  `- Materials: ${scene.materialCount || 'N/A'}\n` +
                  `- States: ${scene.stateCount || 'N/A'}\n` +
                  `- Events: ${scene.eventCount || 'N/A'}\n\n` +
                  `## Embed URL\n\n` +
                  `${scene.embedUrl || 'N/A'}\n\n` +
                  `## Public URL\n\n` +
                  `${scene.publicUrl || 'N/A'}`
          }]
        };
      } catch (error) {
        return {
          contents: [{
            uri: uri.href,
            text: `Error retrieving scene information: ${error.message}`
          }]
        };
      }
    }
  );

  // List scenes resource
  server.resource(
    'spline://scenes',
    async (uri) => {
      try {
        const scenes = await apiClient.request('GET', '/scenes', {
          limit: 20,
          offset: 0
        });
        
        let text = '# Available Spline Scenes\n\n';
        
        if (scenes.length === 0) {
          text += 'No scenes available.';
        } else {
          scenes.forEach(scene => {
            text += `## ${scene.name}\n\n` +
                    `- ID: ${scene.id}\n` +
                    `- Description: ${scene.description || 'N/A'}\n` +
                    `- Resource URI: spline://scene/${scene.id}\n\n`;
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
            text: `Error retrieving scenes: ${error.message}`
          }]
        };
      }
    }
  );

  // Object resource
  server.resource(
    'spline://scene/{sceneId}/object/{objectId}',
    async (uri) => {
      const parts = uri.pathname.split('/');
      const sceneId = parts[2];
      const objectId = parts[4];
      try {
        const object = await apiClient.getObject(sceneId, objectId);
        
        return {
          contents: [{
            uri: uri.href,
            text: `# Spline Object: ${object.name}\n\n` +
                  `## Object Details\n\n` +
                  `- ID: ${object.id}\n` +
                  `- Name: ${object.name}\n` +
                  `- Type: ${object.type || 'N/A'}\n` +
                  `- Visible: ${object.visible ? 'Yes' : 'No'}\n\n` +
                  `## Transform\n\n` +
                  `### Position\n` +
                  `- X: ${object.position?.x || 0}\n` +
                  `- Y: ${object.position?.y || 0}\n` +
                  `- Z: ${object.position?.z || 0}\n\n` +
                  `### Rotation\n` +
                  `- X: ${object.rotation?.x || 0}°\n` +
                  `- Y: ${object.rotation?.y || 0}°\n` +
                  `- Z: ${object.rotation?.z || 0}°\n\n` +
                  `### Scale\n` +
                  `- X: ${object.scale?.x || 1}\n` +
                  `- Y: ${object.scale?.y || 1}\n` +
                  `- Z: ${object.scale?.z || 1}\n\n` +
                  `## Material\n\n` +
                  `${object.material ? `- Material ID: ${object.material.id}\n- Material Name: ${object.material.name || 'N/A'}` : 'No material assigned'}`
          }]
        };
      } catch (error) {
        return {
          contents: [{
            uri: uri.href,
            text: `Error retrieving object information: ${error.message}`
          }]
        };
      }
    }
  );

  // List objects resource
  server.resource(
    'spline://scene/{sceneId}/objects',
    async (uri) => {
      const sceneId = uri.pathname.split('/')[2];
      try {
        const objects = await apiClient.getObjects(sceneId);
        
        let text = `# Objects in Scene (ID: ${sceneId})\n\n`;
        
        if (objects.length === 0) {
          text += 'No objects available in this scene.';
        } else {
          objects.forEach(object => {
            text += `## ${object.name}\n\n` +
                    `- ID: ${object.id}\n` +
                    `- Type: ${object.type || 'N/A'}\n` +
                    `- Resource URI: spline://scene/${sceneId}/object/${object.id}\n\n`;
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
            text: `Error retrieving objects: ${error.message}`
          }]
        };
      }
    }
  );
};
